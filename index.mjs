// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const { nanoid } = require('nanoid');
// const { isValidURL } = require('./helper');

import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import {isValidURL} from './helper/index.mjs'

const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URL, {})

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: { type: String, requried: true }
});
const Url = mongoose.model('Url', urlSchema);

app.use(cors());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  console.log(req.body)
  const { url } = req.body;
  const isValid = await isValidURL(url)
  console.log(url, isValid)

  if (!isValid) {
    return res.status(200).json({ error: 'Invalid URL' })
  }

  try {
    let existingUrl = await Url.findOne({ original_url: url });
    if (existingUrl) return res.json({ original_url: url, short_url: existingUrl.short_url });

    const shortUrl = nanoid(8);
    const newUrl = new Url({
      original_url: url,
      short_url: shortUrl
    });
    await newUrl.save();
    res.json({ original_url: url, short_url: shortUrl });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server Error' })
  }
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  // 0dO3C86Z
  const { short_url } = req.params;
  try {
    let url = await Url.findOne({ short_url: short_url });
    if (!url) return res.status(404).json({ error: 'Short URL not found' });
    res.redirect(url.original_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
