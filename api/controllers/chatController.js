const Chat = require('../models/Chat');
const User = require('../models/User');

// Showing the chats for a user
exports.ShowChats = async (req, res) => {
  try{
    const userId = req.user.id

    // Find the chats where the user participates.
    const chats = await Chat.find({ participants: userId })
        .populate('participants', 'username')
        .exec();

    res.status(200).json({ chats })
  } catch (error) {
    console.error('Error fetching chats: ', error);
    res.status(500).json({ error: 'An error occured while fetching chats' })
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (! receiverId || !content){
      return res.status(400).json({ error: 'Invalid receiver or message content' });
    }

    // Check if chats exists betwetween sender and receiver
    let chat = await Chat.findOne({
      participants: {$all: [senderId, receiverId] },
    }).exec();

    // If there are no chats, create a new chat
    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
      });
    }

    // Adding the message to the chat
    io.to(receiverSocketId).emit('newMessage', {
      senderId,
      content,
    })

    await chat.save();
    

    res.status(200).json({message: 'Message sent'});
  } catch (error) {
    console.error('Error while sending message:', error);
    res.status(500).json({error: 'An error occurred while sending the message'})
  }
};

