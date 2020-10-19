# Chambre downloader

## Setup

### Installation

```
npm i
```

### Configuration

Create a `.env` file and set values based on `.env.example`.

## Usage

```
node download-videos.js -k your+requested+keywords -l limitSubscribeNumber

Set the requested keyword(s) after the -l argument. For multiple keywords, use '+' between each keyword.
Set the channel subscribers count limit by typing a number after the -l argument.

exemple : node download-video.js -k room+gaming l- 301

```
