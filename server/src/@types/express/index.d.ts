import { BlueButton } from "cms-bluebutton-sdk";
import { Environments } from 'cms-bluebutton-sdk';

import express from "express";

declare global {
  namespace Express {
    interface Request {
      bb?: BlueButton
    }
  }
}