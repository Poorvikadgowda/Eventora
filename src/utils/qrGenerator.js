import QRCode from 'qrcode';

export const generateQrDataUrl = async (text, options = {}) => {
  try {
    const url = await QRCode.toDataURL(text, {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    return url;
  } catch (err) {
    console.error('Error generating QR code', err);
    return '';
  }
};
