import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/videoDurationUtil.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    query = "", 
    sortBy = "createdAt",  
    sortType = "desc", 
    userId 
} = req.query;
  if(!req.user){
    throw new ApiError(400, "User needs to be logged in");
  }

  const match = {
    ...(query ? { title: { $regex: query, $options: "i" } } : {}),
    ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}),
  };

  const videos = await Video.aggregate([
    {
        $match:match,
    },
    {
        $lookup:{
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "videoByOwner"
        }   
    },
    {
        $project:{
            videoFile:1,
            thumbnail:1,
            title:1,
            description:1,
            duration:1,
            views:1,
            isPublished:1,
            owner: {
                $let: {
                  vars: {
                    owner: { $arrayElemAt: ["$videoByOwner", 0] }
                  },
                  in: {
                    _id: "$$owner._id",
                    username: "$$owner.username",
                    email: "$$owner.email",
                    fullname: "$$owner.fullName"
                  }
                }
              }
        }
    },
    {
        $sort:{
            [sortBy]:sortType==="desc"?-1:1
        }
    },
    {
        $skip:(page-1)*parseInt(limit)
    },
    {
        $limit: parseInt(limit)
    }
  ]);

  if (!videos?.length) {
    throw new ApiError(404, "Videos are not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, owner } = req.body;

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file not found");
  }
  const thumbnailFileLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailFileLocalPath) {
    throw new ApiError(400, "Thumbnail file not found");
  }

  try {
    const duration = await getVideoDuration(videoFileLocalPath);
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile) {
      throw new ApiError(400, "Video file upload failed");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath);
    if (!thumbnail) {
      throw new ApiError(400, "Thumbnail file upload failed");
    }

    const videoDoc = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      title,
      description,
      owner: req.user._id,
      duration,
    });

    console.log(` Title: ${title}, Owner: ${owner}, duration: ${duration}`);

    if (!videoDoc) {
      throw new ApiError(500, "Something went wrong while publishing a video");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, videoDoc, "Video published Successfully"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
