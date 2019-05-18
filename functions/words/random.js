const fs = require('fs');
const nthline = require('nthline');

const toInteger = (num) => {
    
}

const rand = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}
const words = async (filename) => {
    return nthline(row, filename);
}