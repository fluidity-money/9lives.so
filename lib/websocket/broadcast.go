package websocket

import "log/slog"

type (
	// registration for a broadcast. If replies is nil, then it's assumed
	// that someone is unsubscribing!
	registration[A any] struct {
		cookieReply chan uint64
		replies     chan A
	}

	// Broadcast for sending messages to channels subscribing to events here
	Broadcast[A any] struct {
		broadcastRequests      chan A
		subscriptionRequests   chan registration[A]
		unsubscriptionRequests chan uint64
		shutdownRequests       chan bool
		subscribedCount        uint64
		subscribed             map[uint64]chan A
	}
)

// NewBroadcast, creating a new map and new counter for messages and set
// up the server that handles new subscriptions.
func NewBroadcast[A any]() *Broadcast[A] {
	var (
		broadcastRequests      = make(chan A)
		subscriptionRequests   = make(chan registration[A])
		unsubscriptionRequests = make(chan uint64)
		shutdownRequests       = make(chan bool)
	)
	broadcast := Broadcast[A]{
		broadcastRequests:      broadcastRequests,
		subscriptionRequests:   subscriptionRequests,
		unsubscriptionRequests: unsubscriptionRequests,
		shutdownRequests:       shutdownRequests,
		subscribedCount:        0,
		subscribed:             make(map[uint64]chan A),
	}
	go func() {
		for {
			select {
			case message := <-broadcastRequests:
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

func (broadcast *Broadcast[A]) incrementCookie() (previous uint64) {
	previous = broadcast.subscribedCount
	broadcast.subscribedCount++
	return previous
}

// Subscribe to the broadcast, with a new channel receiving messages being sent.
func (broadcast Broadcast[A]) Subscribe(messages chan A) uint64 {
	slog.Debug("subscribe request")
	cookieChan := make(chan uint64)

	broadcast.subscriptionRequests <- registration[A]{
		cookieReply: cookieChan,
		replies:     messages,
	}

	cookie := <-cookieChan
	slog.Debug("subscribe response",
		"cookie", cookie,
	)
	return cookie
}

func (broadcast Broadcast[A]) Unsubscribe(cookie uint64) {
	broadcast.unsubscriptionRequests <- cookie
}

// Shutdown the broadcast, closing the inner worker.
func (broadcast *Broadcast[A]) Shutdown() {
	broadcast.shutdownRequests <- true
}

func (broadcast Broadcast[A]) Broadcast(message A) {
	broadcast.broadcastRequests <- message
}
