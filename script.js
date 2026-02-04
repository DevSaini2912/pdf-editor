let imageBlobs = [];

function startCreatePDF() {
  const choice = confirm(
    "Press OK to click image\nPress Cancel to select from storage"
  );

  if (choice) {
    document.getElementById("cameraInput").click();
  } else {
    document.getElementById("storageInput").click();
  }
}

// CAMERA
document.getElementById("cameraInput").addEventListener("change", e => {
  handleFiles(e.target.files);
  askMorePhotos();
});

// STORAGE
document.getElementById("storageInput").addEventListener("change", e => {
  handleFiles(e.target.files);
  createPDF();
});

function handleFiles(files) {
  for (let file of files) {
    imageBlobs.push(file);

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "80px";
    document.getElementById("preview").appendChild(img);
  }
}

// ASK FOR MORE CAMERA PHOTOS
function askMorePhotos() {
  setTimeout(() => {
    if (confirm("Take another photo?")) {
      document.getElementById("cameraInput").click();
    } else {
      createPDF();
    }
  }, 300);
}

// CREATE PDF
async function createPDF() {
  if (imageBlobs.length === 0) return;

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let file of imageBlobs) {
    const bytes = await file.arrayBuffer();
    const img = await pdfDoc.embedJpg(bytes);

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0 });
  }

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, "my_pdf.pdf");

  imageBlobs = [];
  document.getElementById("preview").innerHTML = "";
}

function download(bytes, name) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}
