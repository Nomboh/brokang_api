import Message from "../model/message.js";
import { catchAsync } from "../utils/async.js";

export const createMessage = catchAsync(async (req, res, next) => {
  const { message, conversationId, senderName, recieverId } = req.body;

  const createdmsg = await Message.create({
    conversationId,
    senderId: req.user.id,
    recieverId,
    senderName,
    message: {
      text: message,
      image: "",
    },
  });

  res.status(201).json({
    success: true,
    message: createdmsg,
  });
});

export const createImageMessage = catchAsync(async (req, res, next) => {
  const { image, conversationId, senderName, recieverId } = req.body;

  const createdmsg = await Message.create({
    conversationId,
    senderId: req.user.id,
    recieverId,
    senderName,
    message: {
      text: "",
      image,
    },
  });

  res.status(201).json({
    success: true,
    message: createdmsg,
  });
});

export const getMessages = catchAsync(async (req, res, next) => {
  const recieverId = req.params.id;
  const myId = req.user.id;

  const allMessages = await Message.find({
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
  });

  res.status(200).json(allMessages);
});

export const updateSeenMsg = catchAsync(async (req, res, next) => {
  const { _id } = req.body;

  await Message.findByIdAndUpdate(_id, { status: "seen" });
  res.status(200).json({ success: true });
});

export const updateSeenDel = catchAsync(async (req, res, next) => {
  const { _id } = req.body;

  await Message.findByIdAndUpdate(_id, { status: "delivered" });
  res.status(200).json({ success: true });
});

export const seenAllMessages = catchAsync(async (req, res, next) => {
  const recieverId = req.params.id;
  const myId = req.user.id;

  await Message.updateMany(
    {
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

            {
              status: {
                $ne: "seen",
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
            {
              status: {
                $ne: "seen",
              },
            },
          ],
        },
      ],
    },
    {
      $set: {
        status: "seen",
      },
    }
  );

  res.status(200).json({ success: true });
});
