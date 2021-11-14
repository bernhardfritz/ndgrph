import { NullaryFunctionNode, BinaryFunctionNode } from 'ndgrph/dist';

let previewConnection = undefined;
const controllers = [];

const dragElement = (elmnt) => {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  const closeDragElement = () => {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  };

  const elementDrag = (e) => {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
    elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    refreshCanvas();
  };

  const dragMouseDown = (e) => {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  };

  const nodeHeader = elmnt.querySelector('.node__header');
  if (nodeHeader) {
    /* if present, the header is where you move the DIV from:*/
    nodeHeader.onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }
};

const connectPorts = (elem, isInput) => {
  let inputPort = isInput ? elem : undefined;
  let outputPort = isInput ? undefined : elem;

  const handleMouseUp = (e) => {
    if (isInput) {
      outputPort = e.target;
    } else {
      inputPort = e.target;
    }
    const inputController = controllers.find(
      (controller) => controller.view.inputs.indexOf(inputPort) !== -1,
    );
    const outputController = controllers.find(
      (controller) => controller.view.output === outputPort,
    );
    if (inputController !== undefined && outputController !== undefined) {
      inputController.model.inputs[
        inputController.view.inputs.indexOf(inputPort)
      ] = outputController.model.output;
      console.log(inputController.model.output());
    }
    previewConnection = undefined;
    document.onmouseup = null;
    document.onmousemove = null;
    refreshCanvas();
  };

  const handleMouseMove = (e) => {
    e = e || window.event;
    e.preventDefault();
    previewConnection = [
      getCenter(isInput ? inputPort : outputPort),
      [e.clientX, e.clientY],
    ];
    refreshCanvas();
  };

  const handleMouseDown = (e) => {
    e = e || window.event;
    e.preventDefault();
    previewConnection = [
      getCenter(isInput ? inputPort : outputPort),
      [window.scrollX + e.clientX, window.scrollY + e.clientY],
    ];
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    refreshCanvas();
  };

  elem.onmousedown = handleMouseDown;
};

const addValueNode = () => {
  const value = +prompt();
  const model = new NullaryFunctionNode(() => value);
  const view = addNode(model.inputs.length);
  const controller = {
    model,
    view,
  };
  controllers.push(controller);
};

const addSumNode = () => {
  const model = new BinaryFunctionNode((a, b) => a + b);
  const view = addNode(model.inputs.length);
  const controller = {
    model,
    view,
  };
  controllers.push(controller);
};

const addNode = (inputsLength) => {
  const nodes = document.getElementById('nodes');
  const node = appendNode(nodes);
  const nodeInputs = node.querySelector('.node__inputs');
  const inputs = [];
  for (let i = 0; i < inputsLength; i++) {
    const nodeInput = appendNodeInput(nodeInputs);
    const nodeInputLabel = nodeInput.querySelector('.node__input-label');
    nodeInputLabel.textContent = `input[${i}]`;
    const nodeInputPort = nodeInput.querySelector('.node__input-port');
    connectPorts(nodeInputPort, true);
    inputs.push(nodeInputPort);
  }
  const nodeOutput = node.querySelector('.node__output');
  const nodeOutputPort = nodeOutput.querySelector('.node__output-port');
  connectPorts(nodeOutputPort, false);
  const output = nodeOutputPort;
  dragElement(node);
  return {
    inputs,
    output,
  };
};

const appendNode = (parent) => {
  const nodeTemplate = document.getElementById('node-template');
  parent.appendChild(nodeTemplate.content.cloneNode(true));
  const nodes = parent.querySelectorAll('.node');
  return nodes[nodes.length - 1];
};

const appendNodeInput = (parent) => {
  const nodeInputTemplate = document.getElementById('node-input-template');
  parent.appendChild(nodeInputTemplate.content.cloneNode(true));
  const nodeInputs = parent.querySelectorAll('.node__input');
  return nodeInputs[nodeInputs.length - 1];
};

const getCenter = (elem) => {
  const bbox = elem.getBoundingClientRect();
  return [
    bbox.left + (bbox.right - bbox.left) / 2,
    bbox.top + (bbox.bottom - bbox.top) / 2,
  ];
};

const drawBezierCurve = (ctx, start, end) => {
  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  ctx.bezierCurveTo(end[0], start[1], start[0], end[1], end[0], end[1]);
  ctx.strokeStyle = 'rgb(255, 255, 255)';
  ctx.stroke();
};

const refreshCanvas = () => {
  const canvas = document.getElementById('canvas');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(35, 35, 35)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const spacing = 32;
  for (
    let row = 0;
    row < Math.ceil((window.scrollY + canvas.height) / spacing);
    row++
  ) {
    const y = row * spacing - window.scrollY;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.lineWidth = row % 5 === 0 ? 2 : 1;
    ctx.strokeStyle = 'rgb(25, 25, 25)';
    ctx.stroke();
  }
  for (
    let column = 0;
    column < Math.ceil((window.scrollX + canvas.width) / spacing);
    column++
  ) {
    const x = column * spacing - window.scrollX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.lineWidth = column % 5 === 0 ? 2 : 1;
    ctx.strokeStyle = 'rgb(25, 25, 25)';
    ctx.stroke();
  }
  for (let i = 0; i < controllers.length; i++) {
    for (let j = 0; j < controllers.length; j++) {
      if (i === j) {
        continue;
      }
      for (let k = 0; k < controllers[i].model.inputs.length; k++) {
        if (controllers[i].model.inputs[k] === controllers[j].model.output) {
          const start = getCenter(controllers[i].view.inputs[k]);
          const end = getCenter(controllers[j].view.output);
          drawBezierCurve(ctx, start, end);
        }
      }
    }
  }
  if (previewConnection !== undefined) {
    const [start, end] = previewConnection;
    drawBezierCurve(ctx, start, end);
  }
};

document.onscroll = (e) => {
  refreshCanvas();
};

window.onresize = (e) => {
  refreshCanvas();
};

refreshCanvas();

window.addValueNode = addValueNode;
window.addSumNode = addSumNode;
