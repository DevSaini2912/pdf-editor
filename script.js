let images = [];

document.getElementById("imgInput").addEventListener("change", e => {
  images = [];
  document.getElementById("preview").innerHTML = "";

  for (let file of e.target.files) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    document.getElementById("preview").appendChild(img);
    images.push(img);
  }
});

async function createPDF() {
  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let img of images) {
    const bytes = await fetch(img.src).then(r => r.arrayBuffer());
    const pdfImg = await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([pdfImg.width, pdfImg.height]);
    page.drawImage(pdfImg, { x: 0, y: 0 });
  }

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, "my_pdf.pdf");
}

function download(bytes, name) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}
