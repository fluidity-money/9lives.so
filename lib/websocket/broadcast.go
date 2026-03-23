package websocket

import "log/slog"

type (
	registration[A any] struct {
		cookieReply chan uint64
		replies     chan A
	}

	Broadcast[A any] struct {
		broadcastRequests      chan A
		subscriptionRequests   chan registration[A]
		unsubscriptionRequests chan uint64
		shutdownRequests       chan bool
		subscribedCount        uint64
		subscribed             map[uint64]chan A
	}
)

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
				// Close the channel so any goroutine reading from it
				// gets notified, then remove from the map immediately.
				if ch, ok := broadcast.subscribed[cookie]; ok && ch != nil {
					close(ch)
				}
				delete(broadcast.subscribed, cookie)
			case <-shutdownRequests:
				slog.Debug("received a request to shutdown the broadcast server")
				// Close all subscriber channels before returning.
				for cookie, ch := range broadcast.subscribed {
					if ch != nil {
						close(ch)
					}
					delete(broadcast.subscribed, cookie)
				}
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

func (broadcast *Broadcast[A]) Shutdown() {
	broadcast.shutdownRequests <- true
}

func (broadcast Broadcast[A]) Broadcast(message A) {
	broadcast.broadcastRequests <- message
}
