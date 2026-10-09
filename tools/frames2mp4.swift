// Encodes a folder of screencast frames into an H.264 MP4 (no ffmpeg needed).
//   swift tools/frames2mp4.swift <frames-dir> <out.mp4> [width] [bits-per-second] [crop x,y,w,h]
// The folder holds frame-00000.jpg… plus times.json, a list of seconds for each
// frame, so the clip keeps the real pacing of the recording.
// Optional opts.json (written by record.mjs):
//   { "cuts": [frame indices], "fade": 0.35, "loopFade": 0.5 }
//   cuts      frames where the recording jumped (a page load, a route change, an
//             anchor jump); the frame before each cut dissolves into the new view
//             over "fade" seconds instead of hard-cutting
//   loopFade  the last seconds dissolve back into the first frame, so a looping
//             clip restarts without a jump (0 = off)
import AVFoundation
import AppKit

let args = CommandLine.arguments
let dir = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[2])
let times = try! JSONDecoder().decode([Double].self, from: Data(contentsOf: dir.appendingPathComponent("times.json")))
struct Opts: Decodable { var cuts: [Int]?; var fade: Double?; var loopFade: Double? }
let opts = (try? JSONDecoder().decode(Opts.self, from: Data(contentsOf: dir.appendingPathComponent("opts.json")))) ?? Opts()
let cuts = Set(opts.cuts ?? [])
let fade = opts.fade ?? 0.35
let loopFade = opts.loopFade ?? 0
let fps = 30.0

var cache: [Int: CGImage] = [:]
func image(_ i: Int) -> CGImage? {
  if let c = cache[i] { return c }
  guard let img = NSImage(contentsOf: dir.appendingPathComponent(String(format: "frame-%05d.jpg", i)))?.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
  if cache.count > 10 { cache = cache.filter { $0.key == 0 } }
  cache[i] = img
  return img
}
let first = image(0)!
// optional crop (source pixels): only that part of each frame is kept
// "x,y,w,h@cssWidth": the crop is in CSS px; scale it to the frames' real size
let crop: CGRect = args.count > 5 ? {
  let parts = args[5].split(separator: "@"); let v = parts[0].split(separator: ",").map { CGFloat(Double($0)!) }
  let k = parts.count > 1 ? CGFloat(first.width) / CGFloat(Double(parts[1])!) : 1
  return CGRect(x: v[0] * k, y: v[1] * k, width: v[2] * k, height: v[3] * k)
}() : CGRect(x: 0, y: 0, width: first.width, height: first.height)
var w = args.count > 3 ? Int(args[3])! : Int(crop.width)
w -= w % 2
var h = Int(Double(crop.height) * Double(w) / Double(crop.width))
h -= h % 2

// The output schedule: each sample is a frame, optionally with a second frame
// laid over it at some opacity (the dissolves)
struct Sample { var t: Double; var base: Int; var over: Int? = nil; var alpha: Double = 0 }
let smooth = { (x: Double) -> Double in let k = min(1, max(0, x)); return k * k * (3 - 2 * k) }
// the latest frame at or before time t, from index i on
func latest(from i: Int, at t: Double) -> Int { var j = i; while j + 1 < times.count && times[j + 1] <= t { j += 1 }; return j }
let end = times.last ?? 0
let loopStart = loopFade > 0 ? end - loopFade : .infinity
var samples: [Sample] = []
var last = -1.0
var i = 0
while i < times.count {
  let t = times[i]
  if t >= loopStart { break }
  if cuts.contains(i) && i > 0 {
    // dissolve from the frame before the cut into whatever plays next
    let tc = max(t, last + 1 / fps), n = max(1, Int((fade * fps).rounded()))
    for k in 0...n {
      let tk = tc + Double(k) / fps
      if tk >= loopStart { break }
      samples.append(Sample(t: tk, base: latest(from: i, at: tk), over: k == n ? nil : i - 1, alpha: 1 - smooth(Double(k) / Double(n))))
      last = tk
    }
    i += 1
    while i < times.count && times[i] <= last && !cuts.contains(i) { i += 1 }
    continue
  }
  // timestamps must keep rising (a frame that lands late after a pause is dropped)
  if t > last + 0.004 { samples.append(Sample(t: t, base: i)); last = t }
  i += 1
}
if loopFade > 0 {
  // dissolve back to the first frame over the end of the clip
  let t0 = max(loopStart, last + 1 / fps), n = max(1, Int(((end - t0) * fps).rounded(.up)))
  for j in 0...n {
    let tk = t0 + (end - t0) * Double(j) / Double(n)
    samples.append(Sample(t: tk, base: latest(from: 0, at: tk), over: 0, alpha: smooth((tk - loopStart) / loopFade)))
  }
}

try? FileManager.default.removeItem(at: out)
let writer = try! AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: w, AVVideoHeightKey: h,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: args.count > 4 ? Int(args[4])! : 1_400_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let k = CGFloat(w) / crop.width
var written = 0, blended = 0
for s in samples {
  guard let img = image(s.base) else { continue }
  while !input.isReadyForMoreMediaData { usleep(2000) }
  var pb: CVPixelBuffer?
  guard let pool = adaptor.pixelBufferPool else { print("writer failed:", writer.error as Any); exit(1) }
  CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb)
  CVPixelBufferLockBaseAddress(pb!, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: w, height: h, bitsPerComponent: 8,
                      bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  ctx.interpolationQuality = .high
  // CoreGraphics counts y from the bottom, the crop from the top
  let rect = { (img: CGImage) in CGRect(x: -crop.minX * k, y: -(CGFloat(img.height) - crop.maxY) * k, width: CGFloat(img.width) * k, height: CGFloat(img.height) * k) }
  ctx.draw(img, in: rect(img))
  if let o = s.over, s.alpha > 0.002, let top = image(o) {
    ctx.setAlpha(CGFloat(s.alpha)); ctx.draw(top, in: rect(top)); ctx.setAlpha(1); blended += 1
  }
  CVPixelBufferUnlockBaseAddress(pb!, [])
  if !adaptor.append(pb!, withPresentationTime: CMTime(seconds: s.t, preferredTimescale: 90000)) { print("append failed at", s.t, writer.error as Any); exit(1) }
  written += 1
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed { print("writer failed:", writer.status.rawValue, writer.error as Any); exit(1) }
print("wrote", out.path, "\(w)x\(h)", "from \(first.width)x\(first.height)", written, "frames (\(blended) blended, \(cuts.count) cuts)", String(format: "%.1fs", samples.last?.t ?? 0))
