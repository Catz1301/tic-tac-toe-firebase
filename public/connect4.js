/* Copyright (c) 2024 by Joshua Miller */

console.log('connecc4.js loaded, v0.0.1');

/// Vars
var isMobile = false;

function setup() { // Todo: declare the vars used in this function
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile)
    createCanvas(windowWidth, windowWidth);
  else
    createCanvas(600, 600);
  pixelDensity(5);
  background(153);
  displayDensity(1);
  if (debugging) {
    // debug_setupOwners();
  }
  line(0, 0, width, height);
  frameRate(60);
  console.debug(width, height)
  boardWidth = width - (padding * 2) - dotDiameter * 2; // subtraxt the diameter of the dots, twice. ones for each side horizontally
  baordHeight = height - (padding * 2) - dotDiameter * 2; // subtraxt the diameter of the dots, twice. ones for each side vertically
  dotSpacing = boardWidth / (gridSize - 1);
  translateX = padding + dotDiameter;
  translateY = padding + dotDiameter;
}

function draw() {
  
}