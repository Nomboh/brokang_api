import Conversation from "../model/conversation.js";
import Message from "../model/message.js";
import User from "../model/userModel.js";
import { catchAsync } from "../utils/async.js";

export const createMessage = catchAsync(async (req, res, next) => {
  let message = await Message.create({
    conversation: req.body.conversationId,
    sender: req.user.id,
    text: req.body.text,
  });
  message = await message.populate("sender", "name photo email");
  message = await message.populate("conversation");
  message = await User.populate(message, {
    path: "conversation.members",
    select: "name photo email",
  });

  await Conversation.findByIdAndUpdate(req.body.conversationId, {
    latestMessage: message._id,
  });

  res.status(201).json(message);
});

export const getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    conversation: req.params.conversationId,
  })
    .populate("sender", "name photo email")
    .populate("conversation");
  res.status(200).json(messages);
});

export const delMessages = catchAsync(async (req, res, next) => {
  await Message.deleteMany();
  res.status(204).json("successfully deleted");
});
