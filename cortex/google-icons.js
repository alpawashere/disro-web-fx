/* Cortex Google file marks — applies official product icons only to the
   matching items inside the Meadowlark Brand Assets slide. */
(function () {
  var css = document.createElement('style');
  css.setAttribute('data-cortex-google-file-marks', 'true');
  css.textContent =
    '.cgf-grid .cgf-item:nth-child(1) .cgf-thumb,.cgf-grid .cgf-item:nth-child(3) .cgf-thumb,.cgf-grid .cgf-item:nth-child(4) .cgf-thumb,.cgf-grid .cgf-item:nth-child(5) .cgf-thumb{background-repeat:no-repeat;background-position:center;background-size:30px 30px}' +
    '.cgf-grid .cgf-item:nth-child(1) .cgf-thumb>svg,.cgf-grid .cgf-item:nth-child(3) .cgf-thumb>svg,.cgf-grid .cgf-item:nth-child(4) .cgf-thumb>svg,.cgf-grid .cgf-item:nth-child(5) .cgf-thumb>svg{display:none}' +
    '.cgf-grid .cgf-item:nth-child(1) .cgf-thumb{background-image:url("https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a7254c911be987b92036202_192px%20(1).svg")}' +
    '.cgf-grid .cgf-item:nth-child(3) .cgf-thumb{background-image:url("https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a72323343bb54d5df081401_connector-google-drive.svg")}' +
    '.cgf-grid .cgf-item:nth-child(4) .cgf-thumb{background-image:url("https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a7254c9a58721f547ee750a_192px%20(2).svg")}' +
    '.cgf-grid .cgf-item:nth-child(5) .cgf-thumb{background-image:url("https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a7254c93f1c1a31b0992130_192px.svg")}';
  document.head.appendChild(css);
})();
