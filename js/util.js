

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  var random = Math.floor(Math.random() * (max - min)) + min;

  return random;
};


