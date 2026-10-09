import PDFKit
import AppKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let outDir = args[2]
let width = CGFloat(Double(args.count > 3 ? args[3] : "1600")!)
for i in 0..<doc.pageCount {
  let page = doc.page(at: i)!
  let box = page.bounds(for: .mediaBox)
  let scale = width / box.width
  let size = NSSize(width: box.width * scale, height: box.height * scale)
  let img = page.thumbnail(of: size, for: .mediaBox)
  let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
  let png = rep.representation(using: .png, properties: [:])!
  try! png.write(to: URL(fileURLWithPath: String(format: "%@/page-%02d.png", outDir, i + 1)))
}
print("pages:", doc.pageCount)
