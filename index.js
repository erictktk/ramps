import { drawGraph } from "./draw.js";
import { QuadraticBezier, totalSmoothing } from "./main.js";

const svgElement1 = document.getElementById('svgElement1');

let p0 = [0, 0];
let p1 = [.45, 1];
let p2 = [1, 1];

const pointsArr = [p0, p1, p2];
const pointsArr2 = [[0, 0], [.5, .7], [1, 0]];

//
drawGraph(svgElement1, pointsArr);
//

//
const svgElement2 = document.getElementById('svgElement2');

const quadraticBezierPoints = [];
for(let i = 0; i < 100; i += 1){
    const newPoint = QuadraticBezier(i/100, p0, p1, p2);

    quadraticBezierPoints.push(newPoint);
}

drawGraph(svgElement2, quadraticBezierPoints);
//

//
const svgElement3 = document.getElementById('svgElement3');

const smoothedPoints = totalSmoothing(pointsArr, 25, 5);

drawGraph(svgElement3, smoothedPoints);
//

