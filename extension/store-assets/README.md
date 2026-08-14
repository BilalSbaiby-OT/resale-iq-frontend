# Store assets

| File | Where it goes | Spec |
|---|---|---|
| `store-icon-128.png` | Store icon | 128x128, mark at 96x96 with padding, per Google's guidance |
| `small-promo-440x280.jpg` | Small promo tile | 440x280, JPEG so there is no alpha channel |
| `marquee-1400x560.jpg` | Marquee promo tile | 1400x560, JPEG so there is no alpha channel |
| — | Screenshots | YOU take these. 1280x800. See below. |

Both tiles are JPEG on purpose: the store rejects PNGs with an alpha channel,
and a flattened JPEG cannot have one. The icon stays PNG because transparency
around the rounded corners is wanted there.

## Taking the screenshot (1280x800, at least one required)

Reload the extension first — `chrome://extensions` -> reload on the Resale IQ
card — or you will capture the old build with the panel sitting on top of
Vinted's buy button.

1. Open a Vinted item page where the panel shows a real BUY and a price
2. `Cmd+Option+I` to open DevTools
3. Click the device-toolbar icon (phone/tablet, top-left of DevTools)
4. Set the size dropdown to **Responsive**, then type **1280 x 800**
5. `Cmd+Shift+P`, type `screenshot`, choose **Capture screenshot**

Saves at exactly 1280x800, no cropping. Chrome writes PNG without alpha here,
so it uploads as-is.

Take two or three: one BUY, one SKIP. The panel against a real listing is the
entire pitch — a reseller understands the product from that image alone.
