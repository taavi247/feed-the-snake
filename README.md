# Feed the Snake

## Description

A classic snake game with placeable items. The project was bootstrapped with
Create React App. This is the front end part of larger project where snake controls
come from the machine learning algorithm running on Django (https://github.com/taavi247/snake-brain).

This is a part of learning project on full stack (React, Django) and machine learning (Pytorch). Django was chosen for back end because language compatibility with Pytorch.

## Features

- You can design the grid by placing apples, scissors and walls that affect the snake making it longer, shorter or killing it respectively
- Item and wall generator can be used to place the items according to slider options
- Snake speed is also adjustable with slider
- You can control the snake with the arrow keys or alternatively controls can be received from back end

## Interface

<img
    src='./snake_interface.png'
    style='max-width: 300px'>

Goal for the snake is to get high score by eating apples (yellow squares) and keeping away from the scissors (red squares). User can control the snake with arrow keys, but the main purpose of the interface is to design levels and let the snake be controlled by AI.

First row of buttons __Apples__, __Scissors__, __Wall__ and __Eraser__ are used to draw on the grid.

Everytime snake dies user have to first push __Reset/Generate__ and then __Start__ to begin a new game. When __Autoplay__ is turned on reset and start is done automatically.

__Snake Brain__ controls if the snake is being controlled by user or back end AI.

There is also settings for generators that can be totally turned off by __Zero__ or made automatically vary for each level by turning __Randomize__ on.

Currently settings (__Snake speed__, __Snake Brain__ etc.) should be changed only between reset and start states.

## Used packages:

React v18.2.0<br/>
Node.js v18.8.0

## Installation

If you want to run the project locally then clone it and run:

```
npm install
```
