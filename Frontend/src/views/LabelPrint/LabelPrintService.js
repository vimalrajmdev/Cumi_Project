import QRCode from "qrcode";

export const printLabels = async (labels) => {
  if (!labels || labels.length === 0) return;

  const sortedLabels = [...labels].sort((a, b) => {
    if (a.AssetID !== b.AssetID) {
      return a.AssetID.localeCompare(b.AssetID);
    }
    return a.SequenceNo - b.SequenceNo;
  });

  const qrMap = {};
  for (const lbl of sortedLabels) {
    qrMap[lbl.LocationCode] = await QRCode.toDataURL(lbl.LocationCode, {
      width: 90,
      margin: 0
    });
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0";
  iframe.style.height = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();

  // Group labels into pairs so we can print two per row (left / right).
  // If the count is odd, the last row will just have one label.
  const rows = [];
  for (let i = 0; i < sortedLabels.length; i += 2) {
    rows.push(sortedLabels.slice(i, i + 2));
  }

  const renderLabel = (item) => `
    <div class="label">
      <div class="label-inner">
        <div class="left-section">
          <img src="${qrMap[item.LocationCode]}" />
        </div>
        <div class="right-section">
          <div class="margin1"><b class="fontimp">${item.AssetID}</b></div>
          <div class="margin1Asset">${item.AssetName}</div>
        </div>
      </div>
    </div>
  `;

  let labelsHTML = "";
  rows.forEach((rowItems, idx) => {
    const isLastRow = idx === rows.length - 1;
    labelsHTML += `
      <div class="label-row${isLastRow ? " last-row" : ""}">
        ${rowItems.map(renderLabel).join("")}
      </div>
    `;
  });

  doc.write(`
    <html>
      <head>
        <style>
          @page {
              size: 100mm 50mm;
              margin: 0;
            }

            body {
              margin: 0;
              font-family: Arial, sans-serif;
              font-size: 9pt;
            }

            .label-row {
              display: flex;
              flex-direction: row;
              /* two labels side by side per printed row/page */
              page-break-after: always;
              break-after: page;
            }

            .label-row.last-row {
              page-break-after: auto;
              break-after: auto;
            }

            .label {
              width: 35mm;
              height: 15mm;
              padding: 1mm;
              box-sizing: border-box;
              overflow: hidden;
            }

            .label-inner {
              width: 100%;
              height: 100%;
              display: flex;
              padding: 1mm;
              overflow: hidden;
            }

            .left-section {
              width: 10mm;
              line-height: 1.3;
            }

            .right-section {
              width: 25mm;
              text-align: start;
            }

            .brand {
              font-weight: bold;
              font-size: 10pt;
              margin-top: 0px;
              margin-bottom: 0mm;
            }

            img {
              width: 30px;
              height: 30px;
            }

            .box-number {
              display: inline-block;
              padding: 2px 6px;
              font-size: 8pt;
              font-weight: bold;
            }
        .margin1Asset{
                      font-size: 6pt;
        }
          

            .fontimp {
              font-size: 5pt !important;
            }

        </style>
      </head>
      <body>${labelsHTML}</body>
    </html>
  `);

  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };
};