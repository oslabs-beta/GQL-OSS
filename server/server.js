// const express = require("express")
import express from 'express';

const PORT = 3000,
  app = express();

app.get('/api/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => console.log(`start listening on port : ${PORT}`));
