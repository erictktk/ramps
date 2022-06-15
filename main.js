

//#region utils

//



//#region resampled and gaussian smoothed
const gaussian1D = [.21, .58, .21];

export function getSmoothed(t, pointsArr, segments=100, smoothingIters=5){
  if (t === 0){
    return pointsArr[0];
  }
  else if(t === 1){
    return pointsArr[pointsArr.length-1];
  }
  else if (t < 0 || t > 1){
    throw new Error('t must be in range of [0, 1]!');
  }

  const finalPointsArr = totalSmoothing(pointsArr, segments, smoothingIters);

  return pieceWiseLinearRamp(t, finalPointsArr);

}

export function totalSmoothing(pointsArr, segments, smoothingIters){
  const newPointsArr = resample(pointsArr, segments);
  
  const finalPointsArr = gaussianSmooth(newPointsArr, smoothingIters);

  return finalPointsArr;
}

/**
 * Number of newPoints will be segments+1
 * 
 * @param {Array<Array<Int>>} pointsArr 
 * @param {Int} segments
 */
function resample(pointsArr, segments=100){
    const newPointsArr = [];

    const tDelta = 1./segments;

    for(let i = 0; i < segments; i += 1){
        const curT = tDelta*i;

        const newPoint = pieceWiseLinearRamp(curT, pointsArr);

        newPointsArr.push(newPoint);
    }
    const lastPoint = pointsArr[pointsArr.length-1];
    newPointsArr.push( [lastPoint[0], lastPoint[1]] );
    
    return newPointsArr;
}

function gaussianSmooth(pointsArr, iterations=5){
    let curPoints = pointsArr;
    let newPoints = null;
    for(let i = 0; i < iterations; i += 1){
        newPoints = gaussianSingleIter(curPoints);
        curPoints = newPoints;
    }

    return newPoints;
}

function gaussianSingleIter(pointsArr){
    const newArr = [];
    newArr.push( [pointsArr[0][0], pointsArr[0][1]] );
    for(let i = 1; i < pointsArr.length-1; i += 1){
        const prev = pointsArr[i-1];
        const cur = pointsArr[i];
        const next = pointsArr[i+1];

        const newValue = gaussian1D[0]*prev[1] + gaussian1D[1]*cur[1] + gaussian1D[2]*next[1];

        newArr.push( [cur[0], newValue]);
    }
    const lastPoint = pointsArr[pointsArr.length-1];
    newArr.push( [lastPoint[0], lastPoint[1] ] );

    return newArr;
}
//#endregion

//#region piecewise linear
/**
 * 
 * @param {Float} t in range 0 to 1
 * @param {<Array<Array<Int>>} pointsArr 
 * @returns 
 */
function pieceWiseLinearRamp(t, pointsArr){
    //
    if (t === 0){
      return [...pointsArr[0]];
    }
    if (t === 1){
      return [...pointsArr[pointsArr[pointsArr.length-1]]];
    }
    if (t < 0 && t > 1){
      throw "t must be in range [0, 1]!";
    }
    
    let curX = null;
    let nextX = null
    
    let interval = 0;
    for(let i = 0; i < pointsArr.length-1; i += 1 ){
      curX = pointsArr[i][0];
      nextX = pointsArr[i+1][0];
      
      if (t >= curX && t < nextX){
        interval = i;
        break;
      }
    }
    
    let fracDistance = t-pointsArr[interval][0];
    let beforePoint = pointsArr[interval];
    let afterPoint = pointsArr[interval+1];
    
    return [
      t,
      beforePoint[1] + (afterPoint[1]-beforePoint[1])*(fracDistance/(afterPoint[0]-beforePoint[0])),
    ];
  }
  //#endregion

  

//#region Bezier
  function factorial(n){
    if (n === 0 || n === 1){
      return 1;
    }
    else{
      return n*factorial(n-1);
    }
  }
  
  // n!/(k!*(n-k)!)
  function binomialCoefficients(n, i){
    return factorial(n)/((factorial(i)*factorial(n-i)));
  }
  
  export function QuadraticBezier(t, p0, p1, p2){
    const firstCoeff = ((1-t)**2);
    const secondCoeff = 2*(1-t)*t;
    const thirdCoeff = t**2;
    
    return [
      firstCoeff*p0[0] + secondCoeff*p1[0]+ thirdCoeff*p2[0],
      firstCoeff*p0[1] + secondCoeff*p1[1] + thirdCoeff*p2[1],
    ];
  }
    
  export function FastCubicBezierCurve(t, p0, p1, p2, p3){
    /*
    let firstTerm = ((1-t)**3)*p0;
    let secondTerm = 3*((1-t)**2)*t*p1;
    let thirdTerm = 3*((1-t))*(t**2)*p2;
    let fourthTerm = (t**3)*p3;
    */
    
    const firstCoeff = ((1-t)**3);
    const secondCoeff = 3*((1-t)**2)*t;
    const thirdCoeff = 3*((1-t)**2)*t;
    const fourthCoeff = (t**3);
    
    return [
      firstCoeff*p0[0] + secondCoeff*p1[0] + thirdCoeff*p2[0] + fourthCoeff*p3[0],
      firstCoeff*p0[1] + secondCoeff*p1[1] + thirdCoeff*p2[1]+ fourthCoeff*p3[1]
    ];
  }
  //#endregion


  //#region monotone cubic

  //implementation of a cubic hermite spine from https://en.wikipedia.org/wiki/Monotone_cubic_interpolation


  /**
   * 
   * @param {Array<Array<Number>>} pointsArr 
   */
  const createInterpolant = function(pointsArr){
    // Get consecutive differences and slopes
    const length = pointsArr.length;
    const xs = pointsArr.filter( p => p[0] );
    const ys = pointsArr.filter( p => p[1] );
    var dys = [], dxs = [], ms = [];
    for (let i = 0; i < length - 1; i++) {
      var dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i];
      dxs.push(dx); dys.push(dy); ms.push(dy/dx);
    }

    // Get degree-1 coefficients
    var c1s = [ms[0]];
    for (let i = 0; i < dxs.length - 1; i++) {
      var m = ms[i], mNext = ms[i + 1];
      if (m*mNext <= 0) {
        c1s.push(0);
      } else {
        var dx_ = dxs[i], dxNext = dxs[i + 1], common = dx_ + dxNext;
        c1s.push(3*common/((common + dxNext)/m + (common + dx_)/mNext));
      }
    }
    c1s.push(ms[ms.length - 1]);

    var c2s = [], c3s = [];
    for (let i = 0; i < c1s.length - 1; i++) {
      var c1 = c1s[i], m_ = ms[i], invDx = 1/dxs[i], common_ = c1 + c1s[i + 1] - m_ - m_;
      c2s.push((m_ - c1 - common_)*invDx); c3s.push(common_*invDx*invDx);
    }

    return function(x) {
      // The rightmost point in the dataset should give an exact result
      let rightMostNum = xs.length - 1;
      if (x === xs[rightMostNum]) { return ys[rightMostNum]; }
      
      // Search for the interval x is in, returning the corresponding y if x is one of the original xs
      var low = 0, mid, high = c3s.length - 1;
      while (low <= high) {
        mid = Math.floor(0.5*(low + high));
        var xHere = xs[mid];
        if (xHere < x) { low = mid + 1; }
        else if (xHere > x) { high = mid - 1; }
        else { return ys[mid]; }
      }
      let i = Math.max(0, high);
      
      // Interpolate
      var diff = x - xs[i], diffSq = diff*diff;
      return ys[i] + c1s[i]*diff + c2s[i]*diffSq + c3s[i]*diff*diffSq;
    };
  }

  //#endregion