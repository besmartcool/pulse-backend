const Room = require("../models/room");

router.post("/rooms", async (req, res) => {
  try {
    const { name, users } = req.body;
    const newRoom = new Room({ name, users });
    await newRoom.save();

    res.json({ result: true, room: newRoom });
  } catch (error) {
    console.error("Erreur lors de la création de la room :", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/rooms/:email", async (req, res) => {
  try {
    const rooms = await Room.find({ users: req.params.email });
    res.json(rooms);
  } catch (error) {
    console.error("Erreur lors de la récupération des rooms :", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/message", async (req, res) => {
  try {
    const { text, email, roomId } = req.body;

    const newMessage = new Message({
      text,
      senderId: email,
      roomId,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Envoi via Pusher dans la room spécifique
    pusher.trigger(`chat-${roomId}`, "message", {
      text,
      email,
      timestamp: newMessage.timestamp,
    });

    res.json({ result: true, message: newMessage });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get("/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({
      timestamp: 1,
    });
    res.json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ error: error.message });
  }
});
