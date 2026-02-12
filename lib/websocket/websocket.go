package websocket

import (
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/gorilla/websocket"
)

// DeadlinePong to send after a ping request in the control message
const DeadlinePong = 3 * time.Minute

// websocketUpgrader used in every endpoint in this codebase.
var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	CheckOrigin: func(r *http.Request) bool { return true },
}

// Endpoint handles a HTTP request and upgrades it, giving the user a
// channel to receive messages down and a reply channel to send messages
// to the websocket.
func Endpoint(endpoint string, handler func(string, url.Values, <-chan []byte, chan<- []byte, chan<- error, <-chan bool)) {
	http.HandleFunc(endpoint, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		websocketConn, err := websocketUpgrader.Upgrade(w, r, nil)
		if err != nil {
			slog.Error("failed to handle a websocket upgrade",
				"err", err,
			)
			return
		}
		defer websocketConn.Close()
		ipAddress := r.RemoteAddr
		var (
			messages                   = make(chan []byte, 1000)
			replies                    = make(chan []byte, 1000)
			chanShutdownWriter         = make(chan bool)
			chanHandlerRequestShutdown = make(chan error)
			chanHandlerShutdown        = make(chan bool)
			chanPongs                  = make(chan bool)
		)
		go func() {
			slog.Debug("beginning to read messages",
				"ip", ipAddress,
			)
			for {
				msgType, content, err := websocketConn.ReadMessage()
				if err != nil {
					slog.Error("failed to read websocket message",
						"ip", ipAddress,
						"err", err,
					)
					select {
					case chanHandlerShutdown <- true:
					default:
					}
					select {
					case chanShutdownWriter <- true:
					default:
					}
					return
				}
				switch msgType {
				case websocket.PongMessage:
					continue
				case websocket.PingMessage:
					slog.Debug("incoming ping; scheduling pong",
						"ip", ipAddress,
					)
					select {
					case chanPongs <- true:
					default:
					}
					continue
				case websocket.TextMessage, websocket.BinaryMessage:
					slog.Debug("received websocket message",
						"ip", ipAddress,
						"len", len(content),
					)
				default:
					slog.Debug("received websocket message with unhandled type",
						"ip", ipAddress,
						"type", msgType,
					)
				}
				select {
				case replies <- content:
					slog.Debug("forwarded message to replies channel",
						"ip", ipAddress,
						"len", len(content),
					)
				default:
					slog.Debug("dropped inbound message (replies channel full)",
						"ip", ipAddress,
						"len", len(content),
					)
				}
			}
		}()
		go func() {
			for {
				select {
				case <-chanShutdownWriter:
					slog.Debug("writer shutdown requested",
						"ip", ipAddress,
					)
					return
				case <-chanPongs:
					deadline := time.Now().Add(DeadlinePong)
					slog.Debug("sending pong in response to ping",
						"ip", ipAddress,
						"deadline", deadline,
					)
					if err := websocketConn.WriteControl(websocket.PongMessage, nil, deadline); err != nil {
						slog.Error("failed to write pong control message",
							"ip", ipAddress,
							"err", err,
						)
						select {
						case chanHandlerShutdown <- true:
						default:
						}
						return
					}
					slog.Debug("wrote pong message",
						"ip", ipAddress,
					)
				case message := <-messages:
					slog.Debug("received message to write",
						"ip", ipAddress,
						"len", len(message),
					)
					if err := websocketConn.WriteMessage(websocket.TextMessage, message); err != nil {
						slog.Error("failed to write websocket message",
							"ip", ipAddress,
							"err", err,
						)
						select {
						case chanHandlerShutdown <- true:
						default:
						}
						return
					}
					slog.Debug("wrote websocket message",
						"ip", ipAddress,
						"len", len(message),
					)
				}
			}
		}()
		handler(
			ipAddress,
			r.URL.Query(),
			replies,
			messages,
			chanHandlerRequestShutdown,
			chanHandlerShutdown,
		)
	})
}
