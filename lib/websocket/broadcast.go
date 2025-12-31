package websocket

import (
	"encoding/json"
	"log/slog"

	"github.com/fluidity-money/9lives.so/lib/setup"
)

type (
	// registration for a broadcast. If replies is nil, then it's assumed
	// that someone is unsubscribing!
	registration struct {
		cookieReply chan uint64
		replies     chan []byte
	}

	// Broadcast for sending messages to channels subscribing to events here
	Broadcast struct {
		broadcastRequests      chan []byte
		subscriptionRequests   chan registration
		unsubscriptionRequests chan uint64
		shutdownRequests       chan bool
		subscribedCount        uint64
		subscribed             map[uint64]chan []byte
	}
)

// NewBroadcast, creating a new map and new counter for messages and set
// up the server that handles new subscriptions.
func NewBroadcast() *Broadcast {
	var (
		broadcastRequests      = make(chan []byte)
		subscriptionRequests   = make(chan registration)
		unsubscriptionRequests = make(chan uint64)
		shutdownRequests       = make(chan bool)
	)
	broadcast := Broadcast{
		broadcastRequests:      broadcastRequests,
		subscriptionRequests:   subscriptionRequests,
		unsubscriptionRequests: unsubscriptionRequests,
		shutdownRequests:       shutdownRequests,
		subscribedCount:        0,
		subscribed:             make(map[uint64]chan []byte),
	}
	go func() {
		for {
			select {
			case message := <-broadcastRequests:
				slog.Debug("received a message to broadcast",
					"len", len(message),
					"subscribers", len(broadcast.subscribed),
				)
				for cookie, ch := range broadcast.subscribed {
					if ch == nil {
						delete(broadcast.subscribed, cookie)
						continue
					}
					select {
					case ch <- message:
					default:
						// drop if subscriber is slow
					}
				}
			case subscription := <-subscriptionRequests:
				cookie := broadcast.incrementCookie()
				slog.Debug("received a request to subscribe",
					"cookie", cookie,
				)
				subscription.cookieReply <- cookie
				broadcast.subscribed[cookie] = subscription.replies
				slog.Debug("subscription registered",
					"cookie", cookie,
					"subscribers", len(broadcast.subscribed),
				)
			case cookie := <-unsubscriptionRequests:
				slog.Debug("received a request to unsubscribe",
					"cookie", cookie,
				)
				broadcast.subscribed[cookie] = nil
			case <-shutdownRequests:
				slog.Debug("received a request to shutdown the broadcast server")
				return
			}
		}
	}()
	return &broadcast
}

func (broadcast *Broadcast) incrementCookie() (previous uint64) {
	previous = broadcast.subscribedCount
	broadcast.subscribedCount++
	return previous
}

// Subscribe to the broadcast, with a new channel receiving messages being sent.
func (broadcast Broadcast) Subscribe(messages chan []byte) uint64 {
	slog.Debug("subscribe request")
	cookieChan := make(chan uint64)

	broadcast.subscriptionRequests <- registration{
		cookieReply: cookieChan,
		replies:     messages,
	}

	cookie := <-cookieChan
	slog.Debug("subscribe response",
		"cookie", cookie,
	)
	return cookie
}

func (broadcast Broadcast) Unsubscribe(cookie uint64) {
	broadcast.unsubscriptionRequests <- cookie
}

// Shutdown the broadcast, closing the inner worker.
func (broadcast *Broadcast) Shutdown() {
	broadcast.shutdownRequests <- true
}

func (broadcast Broadcast) Broadcast(message []byte) {
	broadcast.broadcastRequests <- message
}

func (broadcast Broadcast) BroadcastJson(content any) {
	blob, err := json.Marshal(content)
	if err != nil {
		setup.Exitf("failed to marshal broadcast: %v", err)
	}
	broadcast.Broadcast(blob)
}
