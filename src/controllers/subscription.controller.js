import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { createLoggerUtil } from "../utils/logger.js";

const logger = createLoggerUtil("subscription.controller");

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if(channelId===subscriberId){
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId
  });

  if(existingSubscription){
    await Subscription.findByIdAndDelete(existingSubscription._id);
    logger.info(`Subscription removed successfully`);
    return res
    .status(200)
    .json(new ApiResponse(200, existingSubscription, "Subscription removed successfully"));
  };

  const newSubscription = await Subscription.create({
    channel: channelId,
    subscriber: subscriberId
  });
  logger.info(`Subscription added successfully`);
  return res
  .status(200)
  .json(new ApiResponse(200, newSubscription, "Subscription added successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!isValidObjectId(channelId)){
    throw new ApiError(400, "Invalid channelId");
  }

  const subscribers = await Subscription.find({
    channel: channelId
  }).populate("subscriber", "_id fullName email");

  if(!subscribers){
    throw new ApiError(404, "Subscribers not found");
  };

 logger.info(`Subscribers fetched successfully`);

  return res
  .status(200)
  .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));

});


const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if(!isValidObjectId(subscriberId)){
    throw new ApiError(400, "Invalid subscriberId");
  }

  const channels = await Subscription.find({
    subscriber: subscriberId
  }).populate("channel", "_id fullName email");

  if(!channels){
    throw new ApiError(404, "Channels not found");
  };

  logger.info(`Channels fetched successfully`);

  return res
  .status(200)
  .json(new ApiResponse(200, channels, "Channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
