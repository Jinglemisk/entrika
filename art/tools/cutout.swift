// Cuts a person out of a photo with macOS Vision (on this Mac, nothing uploaded) and finds their face.
//   swift art/tools/cutout.swift <photo> <out.png>
// Writes <out.png>: the photo at full size with everything but the person transparent. Prints one line of JSON:
//   {"w": width, "h": height, "face": [x, y, w, h]}   the largest face, as fractions of the photo, origin top-left
// art/tools/portrait.py runs this and works out the crops; call it directly only to check a mask.
import AppKit
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count == 3, let photo = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else {
  FileHandle.standardError.write("usage: swift cutout.swift <photo> <out.png>\n".data(using: .utf8)!)
  exit(2)
}
let handler = VNImageRequestHandler(ciImage: photo)
let mask = VNGenerateForegroundInstanceMaskRequest()
let faces = VNDetectFaceRectanglesRequest()
try handler.perform([mask, faces])
guard let found = mask.results?.first else {
  FileHandle.standardError.write("no person found in \(args[1])\n".data(using: .utf8)!)
  exit(1)
}
let buffer = try found.generateMaskedImage(ofInstances: found.allInstances, from: handler, croppedToInstancesExtent: false)
let cut = CIImage(cvPixelBuffer: buffer)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: cut, to: URL(fileURLWithPath: args[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)

let size = photo.extent.size
var face: [Double] = []
if let f = faces.results?.max(by: { $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height }) {
  let b = f.boundingBox   // Vision: normalised, origin bottom-left
  face = [b.minX, 1 - b.maxY, b.width, b.height].map { (Double($0) * 10000).rounded() / 10000 }
}
let out: [String: Any] = ["w": Int(size.width), "h": Int(size.height), "face": face]
print(String(data: try JSONSerialization.data(withJSONObject: out, options: [.sortedKeys]), encoding: .utf8)!)
