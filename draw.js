function arrToRGBStr(arr){
    const [r, g, b] = [...arr];
    if (arr.length === 4){
        const a = arr[3];
        return `rgb(${r}, ${g}, ${b}, ${a})`;
    }
    else{
        return `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * 
 * @param {SVGElement} svgElement 
 * @param {Array<Number>} point0 
 * @param {Array<Number>} point1 
 * @param {Array<Int>} color 
 */
function createLine(svgElement, point0, point1, color=null){
    if (!color){
        color = [0, 0, 0];
    }

    const colorStr = arrToRGBStr(color);

    console.log("point0");
    console.log(point0);

    const newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    newLine.setAttribute('x1', point0[0].toString());
    newLine.setAttribute('y1', point0[1].toString());
    newLine.setAttribute('x2', point1[0].toString());
    newLine.setAttribute('y2', point1[1].toString());
    newLine.setAttribute("stroke", colorStr);
    //newLine.setAttribute("stroke")

    svgElement.append(newLine);
}

/**
 * 
 * @param {SVGElement} svgElement 
 * @param {Array<Array<Int>>} resampledPointsArr
 */
export function drawGraph(svgElement, resampledPointsArr){
    const width = svgElement.getBoundingClientRect().width;
    const height = svgElement.getBoundingClientRect().height;

    const hP0 = [1, height-1];
    const hP1 = [width, height-1];
    createLine(svgElement, hP0, hP1);

    const vP0 = [1, 1];
    const vP1 = [1, height];
    createLine(svgElement, vP0, vP1);

    //console.log(resampledPointsArr);

    const transformedPoints = [];
    for(let i = 0; i < resampledPointsArr.length; i += 1){
        const curPoint = resampledPointsArr[i];
        const tPoint = [curPoint[0]*width, height-curPoint[1]*height];
        transformedPoints.push(tPoint);
    }

    //console.log(transformedPoints);

    for(let i = 0; i < transformedPoints.length-1; i += 1){
        const p0 = transformedPoints[i];
        const p1 = transformedPoints[i+1];

        createLine(svgElement, p0, p1);
    }

}