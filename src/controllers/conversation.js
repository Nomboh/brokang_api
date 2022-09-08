import { catchAsync } from "../utils/async.js";
import Conversation from "../model/conversation.js";
import User from "../model/userModel.js";

export const createConversation = catchAsync(async (req, res, next) => {
  let conversations = await Conversation.find({
    $and: [
      { members: { $elemMatch: { $eq: req.user.id } } },
      { members: { $elemMatch: { $eq: req.body.userId } } },
    ],
  })
    .populate("members", "-password")
    .populate("latestMessage");

  conversations = await User.populate(conversations, {
    path: "latestMessage.sender",
    select: "name photo email",
  });

  if (conversations.length > 0) {
    res.status(200).json(conversations[0]);
  } else {
    const conversation = await Conversation.create({
      members: [req.user.id, req.body.userId],
    });

    const conv = await Conversation.find({ _id: conversation._id }).populate(
      "members",
      "-password"
    );
    res.status(201).json(conv);
  }
});

export const getConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find().populate("latestMessage");

  res.status(200).json(conversations);
});

export const getConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id).populate(
    "latestMessage"
  );

  res.status(200).json(conversation);
});

export const getUsersConversation = catchAsync(async (req, res, next) => {
  let conversation = await Conversation.find({
    members: { $elemMatch: { $eq: req.user.id } },
  })
    .populate("members", "-password")
    .populate("latestMessage")
    .sort({ createdAt: -1 });

  conversation = await User.populate(conversation, {
    path: "latestMessage.sender",
    select: "name photo email",
  });

  res.status(200).json(conversation);
});
