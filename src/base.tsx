import { FileInput, TextInput, Title, Rows, FormField } from "@canva/app-ui-kit";
import { appProcess } from "@canva/platform";
import * as React from "react";
import * as styles from "styles/components.css";
import { addElementAtPoint, createRichtextRange } from "@canva/design";

var canvasRef, changeTitle;
var wadLoaded = false;
const canvasScreen = new ImageData(320, 200);

export function App() {
  const [title, setTitle] = React.useState("");
  const context = appProcess.current.getInfo();

  React.useEffect(() => {
    changeTitle = (newTitle) => {
      setTitle(newTitle);
    };
  }, []);

  
function ObjectPanel() {  
  canvasRef = React.useRef<HTMLCanvasElement>(null);

  return (
   <div className={styles.scrollContainer}>
    <Title alignment="center" capitalization="default" size="small" tone="primary"> {title} </Title>
      <Rows spacing="2u">
        <FormField
          label="Select a WAD"
          control={(props) => (
                <FileInput accept={['.wad', '.WAD']} disabled={wadLoaded}
                  onDropAcceptedFiles={(event) => openWad(event)}
                />
          )}
        />
        <canvas ref={canvasRef} width={320} height={200} style={{ width: "100%", height: "100%" }} />
        <TextInput name="" onKeyDown={(event) => getKey(event)} placeholder="Button presses go here" value=""/>
      </Rows>
    </div>
  );
}


  if (context.surface === "object_panel") {
    return <ObjectPanel />;
  }

  throw new Error(`Invalid surface: ${context.surface}`);
}

function getCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    throw new Error("HTMLCanvasElement does not exist");
  }

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("CanvasRenderingContext2D does not exist");
  }

  return { canvas, context };
}

function openWad(event) {
    console.log(event);
    const file = event[0];
    if (file && file.size) {
      console.log(file.name);

      const reader = new FileReader();
      reader.onload = function(event) {
        const uint8File = new Uint8Array(event.target.result);
        let stream = FS.open("/" + (file.name).toLowerCase(), "w+");
        FS.write(stream, uint8File, 0, file.size, 0);
        FS.close(stream);
        Module.ccall(
          'doomgeneric_Create',
          'void',
          ['number', 'number'],
          [0, 0]
        );
        wadLoaded=true;
        setInterval(doomTick, 0);
      }
      reader.readAsArrayBuffer(file);
    }
  }

var keys = new Uint8Array(256).fill(0);
var keyQueue = [];

function getKey(event) {
  let doomKey = _toDoomKey(event.keyCode);
  keys[doomKey] = 1;
  keyQueue.push([doomKey, 1]);
}

function doomTick() {
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] > 0) {
      keys[i]++;
    }
    if (keys[i] > 6) {
      keys[i] = 0;
      keyQueue.push([i, 0]);
    }
  }
  _doomgeneric_Tick();
}


function drawScreen(framebuffer_ptr, dwidth, dheight) {
  let framebuffer = Module.HEAPU8.subarray(framebuffer_ptr, framebuffer_ptr + dwidth*dheight*4);
  for (let i = 0; i < dwidth*dheight*4; i += 4) {
    canvasScreen.data[i] = framebuffer[i + 2];
    canvasScreen.data[i + 1] = framebuffer[i + 1];
    canvasScreen.data[i + 2] = framebuffer[i];
    canvasScreen.data[i + 3] = 255;
  }
  const { canvas, context } = getCanvas(canvasRef.current);
  const { width, height } = canvas;
  context.putImageData(canvasScreen, 0, 0);
}

async function insertEndoom(range) {
  await addElementAtPoint({
    type: "richtext",
    range,
  });
}

var ansiColors = [
  "#000000",
  "#0000AA",
  "#00AA00",
  "#00AAAA",
  "#AA0000",
  "#AA00AA",
  "#AA5500",
  "#AAAAAA",
  "#555555",
  "#5555FF",
  "#55FF55",
  "#55FFFF",
  "#FF5555",
  "#FF55FF",
  "#FFFF55",
  "#FFFFFF" 
];

function drawEndoom(endoom_ptr) {
  let endoomData = Module.HEAPU8.subarray(endoom_ptr, endoom_ptr + 4000);
  // const rangeBG = createRichtextRange();
  const rangeFG = createRichtextRange();
  
  for (var y = 0; y < 25; y++) {
    var textRow = "";
    for (var x = 0; x < 160; x += 2) {
      let char = endoomData[y*160 + x];
      let str = String.fromCharCode(char);
      let color = endoomData[y*160 + x + 1];

      // rangeBG.appendText("█", {color: ansiColors[(color >> 4) & 0x7]});
      if (char <= 0x7A) {
        textRow += str;
        rangeFG.appendText(str, {strikethrough: "none", color: ansiColors[color & 0xF]});
      } else if (char == 0xC4) {
        textRow += "-";
        rangeFG.appendText(" ", {strikethrough: "strikethrough", color: ansiColors[color & 0xF]});
      } else {
        textRow += " ";
        rangeFG.appendText(" ", {strikethrough: "none", color: ansiColors[color & 0xF]});
      }
    }
    textRow += "\n";
    // rangeBG.appendText("\n");
    rangeFG.appendText("\n");
    console.log(textRow);
  }

  // insertEndoom(rangeBG);
  insertEndoom(rangeFG);
}

function updateTitle(title_ptr, titleSize) {
  let titleChar = Module.HEAPU8.subarray(title_ptr, title_ptr + titleSize);
  let newTitle = "";
  for (let i = 0; i < titleSize; i++) {
    newTitle += String.fromCharCode(titleChar[i]);
  }
  changeTitle(newTitle);
}