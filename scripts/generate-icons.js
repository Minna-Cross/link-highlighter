const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '..', 'src', 'icons');
fs.mkdirSync(iconDir, { recursive: true });

const icons = {
  16: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVR42mPwWR/wnxLMMGrAqAGjBgwXAwC8u0oflouLkQAAAABJRU5ErkJggg==',
  48: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAARElEQVR42u3PQREAAAQAMFWUVlQAKvi622MBFlk9n4WAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwNUCxzTyWtkPJdYAAAAASUVORK5CYII=',
  128: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAA8klEQVR42u3SMQ0AAAjAMNxgGhE4BBsk9JiBpVHZo7+FCQAYAYAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAgAAEwAwAgABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQDdaDS2JJVLg'
};

for (const [size, base64] of Object.entries(icons)) {
  const filePath = path.join(iconDir, `icon${size}.png`);
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  console.log(`Generated icon${size}.png`);
}
