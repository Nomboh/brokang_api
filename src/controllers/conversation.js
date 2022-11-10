import { catchAsync } from "../utils/async.js";
import Conversation from "../model/conversation.js";
import Message from "../model/message.js";

const getLastMessage = async (myId, recieverId) => {
  const msg = await Message.findOne({
    $or: [
      {
        $and: [
          {
            senderId: {
              $eq: recieverId,
            },
          },
          {
            recieverId: {
              $eq: myId,
            },
          },
        ],
      },
      {
        $and: [
          {
            senderId: {
              $eq: myId,
            },
          },
          {
            recieverId: {
              $eq: recieverId,
            },
          },
        ],
      },
    ],
  }).sort({ updatedAt: -1 });
  return msg;
};

export const createConversation = catchAsync(async (req, res, next) => {
  const myId = req.user.id;
  let conversations = await Conversation.find({
    $and: [
      { members: { $elemMatch: { $eq: req.user.id } } },
      { members: { $elemMatch: { $eq: req.body.userId } } },
    ],
  }).populate("members");

  if (conversations.length > 0) {
    const lastMessage = await getLastMessage(myId, req.body.userId);
    const friendInfo = conversations[0].members.filter(
      m => m.id !== req.user.id
    )[0];

    res.status(200).json({
      friendInfo,
      messageInfo: lastMessage,
    });
  } else {
    let conversation = await Conversation.create({
      members: [req.user.id, req.body.userId],
    });

    conversation = await conversation.populate("members");

    res.status(201).json({
      friendInfo: conversation.members.filter(m => m.id !== req.user.id)[0],
      messageInfo: {},
    });
  }
});

export const getUsersConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.find({
    members: { $elemMatch: { $eq: req.user.id } },
  }).populate("members");

  let friend_message = [];

  for (let i = 0; i < conversation.length; i++) {
    let lastMessaage = await getLastMessage(
      req.user.id,
      conversation[i].members.filter(m => m.id !== req.user.id)[0].id
    );

    friend_message = [
      ...friend_message,
      {
        friendInfo: conversation[i].members.filter(
          m => m.id !== req.user.id
        )[0],
        messageInfo: lastMessaage,
      },
    ];
  }

  res.status(200).json(friend_message);
});

export const getConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findOne({
    $and: [
      { members: { $elemMatch: { $eq: req.user.id } } },
      { members: { $elemMatch: { $eq: req.params.id } } },
    ],
  }).populate("members");

  const friend_message = {
    friendInfo: conversation.members.filter(m => m.id !== req.user.id)[0],
    messageInfo: await getLastMessage(req.user.id, req.params.id),
  };

  res.status(200).json(friend_message);
});
