import BlueButton from "cms-bluebutton"
import express from "express";

declare global {
  namespace Express {
    interface Request {
      bb?: BlueButton
    }
  }
}