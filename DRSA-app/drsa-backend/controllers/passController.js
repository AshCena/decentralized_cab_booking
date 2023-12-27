const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const path = require('path');

const generatePass = async (req, res) => {
  const { passName, userName, signedMessage, tokenId } = req.body;
  const logoPath = path.join(__dirname, '../assets/drsa-logo.png');
  const mainImagePath = path.join(__dirname, '../assets/drsa-main.png');

  try {
    // Generate QR Code
    const qrCodeData = await QRCode.toDataURL(`Pass: ${passName}, User: ${userName}`);

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', `attachment; filename=pass-${tokenId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Layout Styling
    doc.fontSize(10);
    doc.fillColor('black');

    // Add main image (Optional: as a header)
    doc.image(mainImagePath, 0, 0, { width: doc.page.width, height: 200 });

    // Add Airline Logo

    // Pass and User Information
    doc.fontSize(24).fillColor('black').text("DRSA XRP PASS", 20, 220, { align: 'center' });

    // doc.text(`DRSA XRP PASS`, 20, 220);

    doc.fontSize(12).text(`Pass Name: ${passName}`, 20, 250);
    doc.text(`User Name: ${userName}`, 20, 270);

    // Airline Boarding Pass Specifics (Example Data)
    // doc.text(`Flight: DR1234`, 20, 150);
    // doc.text(`Boarding Time: 15:30`, 20, 170);
    doc.text(`For Usable Outlets Please Visit our website`, 20, 290);
    doc.text(`Copyright @drsa ltd`, 20, 310);
    doc.text(`Token ID: ${tokenId}`, 20, 330);

    doc.text(`Signed Message: ${signedMessage}`, 20, 350);


    // Add QR Code
    doc.image(qrCodeData, 20, 420, { width: 100, height: 100 });
    doc.image(logoPath, 490, 420, { width: 100, height: 100 });

    // Add Footer (e.g., Terms and Conditions)
    doc.fontSize(8).text('Terms and conditions apply. This pass is non-refundable and non-transferable.', 20, 590, { width: doc.page.width - 40, align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  generatePass,
};
