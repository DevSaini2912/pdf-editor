let images = [];
let cropper;

const createBtn = document.getElementById("createBtn");
const choice = document.getElementById("choice");
const storageInput = document.getElementById("storageInput");
const cameraInput = document.getElementById("cameraInput");
const preview = document.getElementById("preview");
const doneBtn = document.getElementById("doneBtn");

// STEP 1: Create PDF clicked
createBtn.onclick = () => {
  choice.style.display = "block";
};

// STEP 2: Choose source
document.getElementById("storageBtn").onclick = () => {
  storageInput.click();
};

document.getElementById("cameraBtn").onclick = () => {
  cameraInput.click();
};

// STEP 3: Handle images
storageInput.onchange = cameraInput.onchange = e => {
  for (let file of e.target.files) {
    addImage(file);
  }
  choice.style.display = "none";
  doneBtn.style.display = "block";
};

function addImage(file) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.onclick = () => cropImage(img);

  preview.appendChild(img);
  images.push(file);
}

// STEP 4: Crop image
function cropImage(imgEl) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const img = document.createElement("img");
  img.src = imgEl.src;

  const btn = document.createElement("button");
  btn.innerText = "Crop & Save";

  modal.append(img, btn);
  document.body.appendChild(modal);

  cropper = new Cropper(img, { viewMode: 1 });

  btn.onclick = () => {
    cropper.getCroppedCanvas().toBlob(blob => {
      imgEl.src = URL.createObjectURL(blob);
      const index = [...preview.children].indexOf(imgEl);
      images[index] = blob;
      cropper.destroy();
      modal.remove();
    }, "image/jpeg");
  };
}

// STEP 5: Create PDF
doneBtn.onclick = async () => {
  if (images.length === 0) return;

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let file of images) {
    const bytes = await file.arrayBuffer();
    const pdfImg = await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([pdfImg.width, pdfImg.height]);
    page.drawImage(pdfImg, { x: 0, y: 0 });
  }

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, "my_pdf.pdf");

  images = [];
  preview.innerHTML = "";
  doneBtn.style.display = "none";
};

function download(bytes, name) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}
