package ws

type Hub struct {
	Rooms      map[string]map[*Client]bool
	Broadcast  chan Message
	Register   chan *Client
	Unregister chan *Client
}

type Message struct {
	RoomName string
	Data     []byte
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Rooms:      make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			if _, ok := h.Rooms[client.RoomName]; !ok {
				h.Rooms[client.RoomName] = make(map[*Client]bool)
			}
			h.Rooms[client.RoomName][client] = true
		case client := <-h.Unregister:
			if room, ok := h.Rooms[client.RoomName]; ok {
				if _, ok := room[client]; ok {
					delete(room, client)
					close(client.Send)
					if len(room) == 0 {
						delete(h.Rooms, client.RoomName)
					}
				}
			}
		case message := <-h.Broadcast:
			if room, ok := h.Rooms[message.RoomName]; ok {
				for client := range room {
					select {
					case client.Send <- message.Data:
					default:
						close(client.Send)
						delete(room, client)
						if len(room) == 0 {
							delete(h.Rooms, message.RoomName)
						}
					}
				}
			}
		}
	}
}
