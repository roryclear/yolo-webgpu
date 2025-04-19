
const yolov8 = (() => {
const getTensorBuffer = (safetensorBuffer, tensorMetadata) => {
  return safetensorBuffer.subarray(...tensorMetadata.data_offsets);
};

const getTensorMetadata = (safetensorBuffer) => {
    const metadataLength = Number(new DataView(safetensorBuffer.buffer).getBigUint64(0, true));
    const metadata = JSON.parse(new TextDecoder("utf8").decode(safetensorBuffer.subarray(8, 8 + metadataLength)));
    return Object.fromEntries(Object.entries(metadata).filter(([k, v]) => k !== "__metadata__").map(([k, v]) => [k, {...v, data_offsets: v.data_offsets.map(x => 8 + metadataLength + x)}]));
};

const createEmptyBuf = (device, size) => {
    return device.createBuffer({size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST });
};

const createUniformBuf = (device, size) => {
  return device.createBuffer({size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
}

const createInfinityUniformBuf = (device) => {
  const size = 4;
  const buf = device.createBuffer({
    mappedAtCreation: true,
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
  });
  new Float32Array(buf.getMappedRange())[0] = Infinity;
  buf.unmap();
  return buf;
};

const createWeightBuf = (device, size, data) => {
  const buf = device.createBuffer({ size, usage: GPUBufferUsage.STORAGE, mappedAtCreation: true });
  new Uint8Array(buf.getMappedRange()).set(data); buf.unmap();
  return buf;
};

const addComputePass = (device, commandEncoder, pipeline, layout, infinityUniformBuf, bufs, workgroup) => {
  const bindGroup = device.createBindGroup({
    layout: layout,
    entries: [
      { binding: 0, resource: { buffer: infinityUniformBuf } },
      ...bufs.map((buffer, index) => ({ binding: index + 1, resource: { buffer } }))
    ]
  });

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(...workgroup);
  passEncoder.end();
};

const r_13_4_13_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  data0[(lidx0+bitcast<i32>(precast1))] = ((f32((gidx0+gidx0+((lidx0+3)>>2)+gidx0+((lidx0+1)>>2)+gidx0+((lidx0+2)>>2))))+0.5f);
}`;

const r_13_2_26 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@compute @workgroup_size(2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var lidx0 = i32(lindex.x); /* 2 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var alu0 = (lidx0+bitcast<i32>(precast1));
  data0[alu0] = ((f32((select(1,0,(gidx0<12))+select(1,0,(alu0<25))+select(1,0,(alu0<23))+select(1,0,(gidx0<11))+select(1,0,(alu0<21))+select(1,0,(gidx0<10))+select(1,0,(alu0<19))+select(1,0,(gidx0<9))+select(1,0,(alu0<17))+select(1,0,(gidx0<8))+select(1,0,(alu0<15))+select(1,0,(gidx0<7))+select(1,0,(alu0<13))+select(1,0,(gidx0<6))+select(1,0,(alu0<11))+select(1,0,(gidx0<5))+select(1,0,(alu0<9))+select(1,0,(gidx0<4))+select(1,0,(alu0<7))+select(1,0,(gidx0<3))+select(1,0,(alu0<5))+select(1,0,(gidx0<2))+select(1,0,(alu0<3))+select(1,0,(gidx0<1))+select(1,0,(alu0<1)))))+0.5f);
}`;

const r_13_13 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  data0[gidx0] = ((f32((select(1,0,(gidx0<11))+select(1,0,(gidx0<12))+select(1,0,(gidx0<10))+select(1,0,(gidx0<9))+select(1,0,(gidx0<8))+select(1,0,(gidx0<7))+select(1,0,(gidx0<6))+select(1,0,(gidx0<5))+select(1,0,(gidx0<4))+select(1,0,(gidx0<3))+select(1,0,(gidx0<2))+select(1,0,(gidx0<1)))))+0.5f);
}`;

const E_27_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 27 */
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val0 = data1[cast0];
  var alu0 = (cast0+1);
  var val1 = data1[alu0];
  var alu1 = (cast0+2);
  var val2 = data1[alu1];
  var alu2 = (cast0+3);
  var val3 = data1[alu2];
  data0[cast0] = (f32(val0));
  data0[alu0] = (f32(val1));
  data0[alu1] = (f32(val2));
  data0[alu2] = (f32(val3));
}`;

const E_36_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 36 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_8_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 8 */
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val0 = data1[cast0];
  var alu0 = (cast0+1);
  var val1 = data1[alu0];
  var alu1 = (cast0+2);
  var val2 = data1[alu1];
  var alu2 = (cast0+3);
  var val3 = data1[alu2];
  data0[cast0] = (f32(val0));
  data0[alu0] = (f32(val1));
  data0[alu1] = (f32(val2));
  data0[alu2] = (f32(val3));
}`;

const E_8_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_18_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 18 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_12_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 12 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_144_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 144 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_16_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 16 */
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val0 = data1[cast0];
  var alu0 = (cast0+1);
  var val1 = data1[alu0];
  var alu1 = (cast0+2);
  var val2 = data1[alu1];
  var alu2 = (cast0+3);
  var val3 = data1[alu2];
  data0[cast0] = (f32(val0));
  data0[alu0] = (f32(val1));
  data0[alu1] = (f32(val2));
  data0[alu2] = (f32(val3));
}`;

const E_32_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_72_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 72 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_64_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_576_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 576 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val0 = data1[cast0];
  var alu0 = (cast0+1);
  var val1 = data1[alu0];
  var alu1 = (cast0+2);
  var val2 = data1[alu1];
  var alu2 = (cast0+3);
  var val3 = data1[alu2];
  data0[cast0] = (f32(val0));
  data0[alu0] = (f32(val1));
  data0[alu1] = (f32(val2));
  data0[alu2] = (f32(val3));
}`;

const E_128_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_288_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 288 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_256_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_2304_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2304 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_2_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_512_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_1152_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1152 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_768_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 768 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_1024_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_384_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 384 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_192_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 192 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_96_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 96 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_48_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 48 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_360_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 360 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_5_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_450_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 450 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_50_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 50 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_576_32_4n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 576 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_720_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 720 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_1152_32_4n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1152 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_1440_32_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1440 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = (f32(val0));
  data0[alu1] = (f32(val1));
  data0[alu2] = (f32(val2));
  data0[alu3] = (f32(val3));
}`;

const E_4_4n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f16>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val0 = data1[cast0];
  var alu0 = (cast0+1);
  var val1 = data1[alu0];
  var alu1 = (cast0+2);
  var val2 = data1[alu1];
  var alu2 = (cast0+3);
  var val3 = data1[alu2];
  data0[cast0] = (f32(val0));
  data0[alu0] = (f32(val1));
  data0[alu1] = (f32(val2));
  data0[alu2] = (f32(val3));
}`;

const E_1183_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var alu1 = (gidx0<901);
  var alu2 = (gidx0<902);
  var alu3 = (gidx0<1126);
  var alu4 = (gidx0<1127);
  var alu5 = (alu1!=true);
  var alu6 = select(0,8,alu1);
  var alu7 = select(32,0,alu4);
  data0[(alu0+2)] = (f32((alu6+select(0,16,(alu5&alu3))+select(32,0,alu3))));
  data0[(alu0+1)] = (f32((alu6+select(0,16,(alu5&alu4))+alu7)));
  data0[alu0] = (f32((select(0,8,alu2)+select(0,16,((alu2!=true)&alu4))+alu7)));
}`;

const r_80_16_5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<i32, 16>;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 80 */
  var lidx0 = i32(lindex.x); /* 16 */
  var alu0 = (gidx0+(lidx0*5)+-74);
  var alu1 = -select(alu0,0,(alu0<0));
  temp0[lidx0] = select(alu1,-5,(alu1<-5));
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    var acc0 = 0;
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val0 = temp0[ridx1001];
      acc0 = (acc0+val0);
    }
    data0[gidx0] = (acc0+81);
  }
}`;

const r_1183_3549_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  data0[alu0] = alu0;
  var alu2 = (alu0+1);
  data0[alu2] = alu2;
  var alu4 = (alu0+2);
  data0[alu4] = alu4;
}`;

const r_2_13_13_2_16_4_3_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(2,16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var lidx2 = i32(lindex.z); /* 4 */
  var precast0 = lidx2;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = gidx0;
  var cast1 = bitcast<u32>(precast1);
  var alu0 = (((gidx1+lidx1)<1)!=true);
  var alu1 = (((gidx0+lidx2)<1)!=true);
  var precast2 = (cast1<<5u);
  var precast3 = (cast0<<3u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx6 = 0; ridx6 < 3; ridx6++) {
    var alu2 = ((ridx6*9)+(gidx2*216)+(lidx0*108));
    var val0 = data2[alu2];
    var alu3 = (bitcast<i32>(precast2)+bitcast<i32>(precast3)+(ridx6*173056)+(gidx1*13312)+(lidx1*832));
    var val1 = data1[alu3];
    var val2 = data2[(alu2+1)];
    var val3 = data2[(alu2+2)];
    var val4 = data2[(alu2+3)];
    var val5 = data2[(alu2+4)];
    var val6 = data2[(alu2+5)];
    var val7 = data2[(alu2+6)];
    var val8 = data2[(alu2+7)];
    var val9 = data2[(alu2+8)];
    var val10 = data2[(alu2+27)];
    var val11 = data2[(alu2+28)];
    var val12 = data2[(alu2+29)];
    var val13 = data2[(alu2+30)];
    var val14 = data2[(alu2+31)];
    var val15 = data2[(alu2+32)];
    var val16 = data2[(alu2+33)];
    var val17 = data2[(alu2+34)];
    var val18 = data2[(alu2+35)];
    var val19 = data2[(alu2+54)];
    var val20 = data2[(alu2+55)];
    var val21 = data2[(alu2+56)];
    var val22 = data2[(alu2+57)];
    var val23 = data2[(alu2+58)];
    var val24 = data2[(alu2+59)];
    var val25 = data2[(alu2+60)];
    var val26 = data2[(alu2+61)];
    var val27 = data2[(alu2+62)];
    var val28 = data2[(alu2+81)];
    var val29 = data2[(alu2+82)];
    var val30 = data2[(alu2+83)];
    var val31 = data2[(alu2+84)];
    var val32 = data2[(alu2+85)];
    var val33 = data2[(alu2+86)];
    var val34 = data2[(alu2+87)];
    var val35 = data2[(alu2+88)];
    var val36 = data2[(alu2+89)];
    var val37 = select(0.0f, data1[(alu3+-417)], (alu0&alu1));
    var val38 = select(0.0f, data1[(alu3+-416)], alu0);
    var val39 = select(0.0f, data1[(alu3+-415)], alu0);
    var val40 = select(0.0f, data1[(alu3+-414)], alu0);
    var val41 = select(0.0f, data1[(alu3+-413)], alu0);
    var val42 = select(0.0f, data1[(alu3+-412)], alu0);
    var val43 = select(0.0f, data1[(alu3+-411)], alu0);
    var val44 = select(0.0f, data1[(alu3+-410)], alu0);
    var val45 = select(0.0f, data1[(alu3+-409)], alu0);
    var val46 = select(0.0f, data1[(alu3+-1)], alu1);
    var val47 = data1[(alu3+1)];
    var val48 = data1[(alu3+2)];
    var val49 = data1[(alu3+3)];
    var val50 = data1[(alu3+4)];
    var val51 = data1[(alu3+5)];
    var val52 = data1[(alu3+6)];
    var val53 = data1[(alu3+7)];
    var val54 = select(0.0f, data1[(alu3+415)], alu1);
    var val55 = data1[(alu3+416)];
    var val56 = data1[(alu3+417)];
    var val57 = data1[(alu3+418)];
    var val58 = data1[(alu3+419)];
    var val59 = data1[(alu3+420)];
    var val60 = data1[(alu3+421)];
    var val61 = data1[(alu3+422)];
    var val62 = data1[(alu3+423)];
    acc0 = (acc0+(val37*val0)+(val46*val4)+(val54*val7)+(val38*val2)+(val1*val5)+(val55*val8)+(val39*val3)+(val47*val6)+(val56*val9));
    acc1 = (acc1+(val37*val10)+(val46*val13)+(val54*val16)+(val38*val11)+(val1*val14)+(val55*val17)+(val39*val12)+(val47*val15)+(val56*val18));
    acc2 = (acc2+(val37*val19)+(val46*val22)+(val54*val25)+(val38*val20)+(val1*val23)+(val55*val26)+(val39*val21)+(val47*val24)+(val56*val27));
    acc3 = (acc3+(val37*val28)+(val46*val31)+(val54*val34)+(val38*val29)+(val1*val32)+(val55*val35)+(val39*val30)+(val47*val33)+(val56*val36));
    acc4 = (acc4+(val39*val0)+(val47*val4)+(val56*val7)+(val40*val2)+(val48*val5)+(val57*val8)+(val41*val3)+(val49*val6)+(val58*val9));
    acc5 = (acc5+(val39*val10)+(val47*val13)+(val56*val16)+(val40*val11)+(val48*val14)+(val57*val17)+(val41*val12)+(val49*val15)+(val58*val18));
    acc6 = (acc6+(val39*val19)+(val47*val22)+(val56*val25)+(val40*val20)+(val48*val23)+(val57*val26)+(val41*val21)+(val49*val24)+(val58*val27));
    acc7 = (acc7+(val39*val28)+(val47*val31)+(val56*val34)+(val40*val29)+(val48*val32)+(val57*val35)+(val41*val30)+(val49*val33)+(val58*val36));
    acc8 = (acc8+(val41*val0)+(val49*val4)+(val58*val7)+(val42*val2)+(val50*val5)+(val59*val8)+(val43*val3)+(val51*val6)+(val60*val9));
    acc9 = (acc9+(val41*val10)+(val49*val13)+(val58*val16)+(val42*val11)+(val50*val14)+(val59*val17)+(val43*val12)+(val51*val15)+(val60*val18));
    acc10 = (acc10+(val41*val19)+(val49*val22)+(val58*val25)+(val42*val20)+(val50*val23)+(val59*val26)+(val43*val21)+(val51*val24)+(val60*val27));
    acc11 = (acc11+(val41*val28)+(val49*val31)+(val58*val34)+(val42*val29)+(val50*val32)+(val59*val35)+(val43*val30)+(val51*val33)+(val60*val36));
    acc12 = (acc12+(val43*val0)+(val51*val4)+(val60*val7)+(val44*val2)+(val52*val5)+(val61*val8)+(val45*val3)+(val53*val6)+(val62*val9));
    acc13 = (acc13+(val43*val10)+(val51*val13)+(val60*val16)+(val44*val11)+(val52*val14)+(val61*val17)+(val45*val12)+(val53*val15)+(val62*val18));
    acc14 = (acc14+(val43*val19)+(val51*val22)+(val60*val25)+(val44*val20)+(val52*val23)+(val61*val26)+(val45*val21)+(val53*val24)+(val62*val27));
    acc15 = (acc15+(val43*val28)+(val51*val31)+(val60*val34)+(val44*val29)+(val52*val32)+(val61*val35)+(val45*val30)+(val53*val33)+(val62*val36));
  }
  var precast4 = gidx2;
  var precast5 = lidx0;
  var precast6 = (bitcast<u32>(precast4)<<3u);
  var precast7 = (bitcast<u32>(precast5)<<2u);
  var alu21 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val63 = data5[alu21];
  var val64 = data3[alu21];
  var val65 = data4[alu21];
  var val66 = data6[alu21];
  var alu22 = (alu21+1);
  var val67 = data5[alu22];
  var val68 = data3[alu22];
  var val69 = data4[alu22];
  var val70 = data6[alu22];
  var alu23 = (alu21+2);
  var val71 = data5[alu23];
  var val72 = data3[alu23];
  var val73 = data4[alu23];
  var val74 = data6[alu23];
  var alu24 = (alu21+3);
  var val75 = data5[alu24];
  var val76 = data3[alu24];
  var val77 = data4[alu24];
  var val78 = data6[alu24];
  var precast8 = (cast1<<4u);
  var precast9 = (cast0<<2u);
  var alu25 = (bitcast<i32>(precast9)+(lidx1*208)+(lidx0*173056)+bitcast<i32>(precast8)+(gidx1*3328)+(gidx2*346112));
  var cast2 = (f32((1/sqrt((val63+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val67+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val71+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val75+(f16(0.001f)))))));
  var alu26 = (((acc0-val64)*val65*cast2)+val66);
  data0[alu25] = (alu26*(1/(1.0f+exp2((alu26*-1.4426950408889634f)))));
  var alu28 = (((acc1-val68)*val69*cast3)+val70);
  data0[(alu25+43264)] = (alu28*(1/(1.0f+exp2((alu28*-1.4426950408889634f)))));
  var alu30 = (((acc2-val72)*val73*cast4)+val74);
  data0[(alu25+86528)] = (alu30*(1/(1.0f+exp2((alu30*-1.4426950408889634f)))));
  var alu32 = (((acc3-val76)*val77*cast5)+val78);
  data0[(alu25+129792)] = (alu32*(1/(1.0f+exp2((alu32*-1.4426950408889634f)))));
  var alu34 = (((acc4-val64)*val65*cast2)+val66);
  data0[(alu25+1)] = (alu34*(1/(1.0f+exp2((alu34*-1.4426950408889634f)))));
  var alu36 = (((acc5-val68)*val69*cast3)+val70);
  data0[(alu25+43265)] = (alu36*(1/(1.0f+exp2((alu36*-1.4426950408889634f)))));
  var alu38 = (((acc6-val72)*val73*cast4)+val74);
  data0[(alu25+86529)] = (alu38*(1/(1.0f+exp2((alu38*-1.4426950408889634f)))));
  var alu40 = (((acc7-val76)*val77*cast5)+val78);
  data0[(alu25+129793)] = (alu40*(1/(1.0f+exp2((alu40*-1.4426950408889634f)))));
  var alu42 = (((acc8-val64)*val65*cast2)+val66);
  data0[(alu25+2)] = (alu42*(1/(1.0f+exp2((alu42*-1.4426950408889634f)))));
  var alu44 = (((acc9-val68)*val69*cast3)+val70);
  data0[(alu25+43266)] = (alu44*(1/(1.0f+exp2((alu44*-1.4426950408889634f)))));
  var alu46 = (((acc10-val72)*val73*cast4)+val74);
  data0[(alu25+86530)] = (alu46*(1/(1.0f+exp2((alu46*-1.4426950408889634f)))));
  var alu48 = (((acc11-val76)*val77*cast5)+val78);
  data0[(alu25+129794)] = (alu48*(1/(1.0f+exp2((alu48*-1.4426950408889634f)))));
  var alu50 = (((acc12-val64)*val65*cast2)+val66);
  data0[(alu25+3)] = (alu50*(1/(1.0f+exp2((alu50*-1.4426950408889634f)))));
  var alu52 = (((acc13-val68)*val69*cast3)+val70);
  data0[(alu25+43267)] = (alu52*(1/(1.0f+exp2((alu52*-1.4426950408889634f)))));
  var alu54 = (((acc14-val72)*val73*cast4)+val74);
  data0[(alu25+86531)] = (alu54*(1/(1.0f+exp2((alu54*-1.4426950408889634f)))));
  var alu56 = (((acc15-val76)*val77*cast5)+val78);
  data0[(alu25+129795)] = (alu56*(1/(1.0f+exp2((alu56*-1.4426950408889634f)))));
}`;

const r_13_13_8_8_2_16_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(8,8,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 8 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = lidx2;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = gidx0;
  var cast1 = bitcast<u32>(precast1);
  var alu0 = (((gidx1+lidx1)<1)!=true);
  var alu1 = (((gidx0+lidx2)<1)!=true);
  var precast2 = (cast1<<4u);
  var precast3 = (cast0<<3u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx5 = 0; ridx5 < 16; ridx5++) {
    var alu2 = ((lidx0*576)+(ridx5*9));
    var val0 = data2[alu2];
    var alu3 = (bitcast<i32>(precast2)+bitcast<i32>(precast3)+(ridx5*43264)+(gidx1*3328)+(lidx1*416));
    var val1 = data1[alu3];
    var val2 = data2[(alu2+1)];
    var val3 = data2[(alu2+2)];
    var val4 = data2[(alu2+3)];
    var val5 = data2[(alu2+4)];
    var val6 = data2[(alu2+5)];
    var val7 = data2[(alu2+6)];
    var val8 = data2[(alu2+7)];
    var val9 = data2[(alu2+8)];
    var val10 = data2[(alu2+144)];
    var val11 = data2[(alu2+145)];
    var val12 = data2[(alu2+146)];
    var val13 = data2[(alu2+147)];
    var val14 = data2[(alu2+148)];
    var val15 = data2[(alu2+149)];
    var val16 = data2[(alu2+150)];
    var val17 = data2[(alu2+151)];
    var val18 = data2[(alu2+152)];
    var val19 = data2[(alu2+288)];
    var val20 = data2[(alu2+289)];
    var val21 = data2[(alu2+290)];
    var val22 = data2[(alu2+291)];
    var val23 = data2[(alu2+292)];
    var val24 = data2[(alu2+293)];
    var val25 = data2[(alu2+294)];
    var val26 = data2[(alu2+295)];
    var val27 = data2[(alu2+296)];
    var val28 = data2[(alu2+432)];
    var val29 = data2[(alu2+433)];
    var val30 = data2[(alu2+434)];
    var val31 = data2[(alu2+435)];
    var val32 = data2[(alu2+436)];
    var val33 = data2[(alu2+437)];
    var val34 = data2[(alu2+438)];
    var val35 = data2[(alu2+439)];
    var val36 = data2[(alu2+440)];
    var val37 = select(0.0f, data1[(alu3+-209)], (alu0&alu1));
    var val38 = select(0.0f, data1[(alu3+-208)], alu0);
    var val39 = select(0.0f, data1[(alu3+-207)], alu0);
    var val40 = select(0.0f, data1[(alu3+-206)], alu0);
    var val41 = select(0.0f, data1[(alu3+-205)], alu0);
    var val42 = select(0.0f, data1[(alu3+-204)], alu0);
    var val43 = select(0.0f, data1[(alu3+-203)], alu0);
    var val44 = select(0.0f, data1[(alu3+-202)], alu0);
    var val45 = select(0.0f, data1[(alu3+-201)], alu0);
    var val46 = select(0.0f, data1[(alu3+-1)], alu1);
    var val47 = data1[(alu3+1)];
    var val48 = data1[(alu3+2)];
    var val49 = data1[(alu3+3)];
    var val50 = data1[(alu3+4)];
    var val51 = data1[(alu3+5)];
    var val52 = data1[(alu3+6)];
    var val53 = data1[(alu3+7)];
    var val54 = select(0.0f, data1[(alu3+207)], alu1);
    var val55 = data1[(alu3+208)];
    var val56 = data1[(alu3+209)];
    var val57 = data1[(alu3+210)];
    var val58 = data1[(alu3+211)];
    var val59 = data1[(alu3+212)];
    var val60 = data1[(alu3+213)];
    var val61 = data1[(alu3+214)];
    var val62 = data1[(alu3+215)];
    acc0 = (acc0+(val37*val0)+(val46*val4)+(val54*val7)+(val38*val2)+(val1*val5)+(val55*val8)+(val39*val3)+(val47*val6)+(val56*val9));
    acc1 = (acc1+(val37*val10)+(val46*val13)+(val54*val16)+(val38*val11)+(val1*val14)+(val55*val17)+(val39*val12)+(val47*val15)+(val56*val18));
    acc2 = (acc2+(val37*val19)+(val46*val22)+(val54*val25)+(val38*val20)+(val1*val23)+(val55*val26)+(val39*val21)+(val47*val24)+(val56*val27));
    acc3 = (acc3+(val37*val28)+(val46*val31)+(val54*val34)+(val38*val29)+(val1*val32)+(val55*val35)+(val39*val30)+(val47*val33)+(val56*val36));
    acc4 = (acc4+(val39*val0)+(val47*val4)+(val56*val7)+(val40*val2)+(val48*val5)+(val57*val8)+(val41*val3)+(val49*val6)+(val58*val9));
    acc5 = (acc5+(val39*val10)+(val47*val13)+(val56*val16)+(val40*val11)+(val48*val14)+(val57*val17)+(val41*val12)+(val49*val15)+(val58*val18));
    acc6 = (acc6+(val39*val19)+(val47*val22)+(val56*val25)+(val40*val20)+(val48*val23)+(val57*val26)+(val41*val21)+(val49*val24)+(val58*val27));
    acc7 = (acc7+(val39*val28)+(val47*val31)+(val56*val34)+(val40*val29)+(val48*val32)+(val57*val35)+(val41*val30)+(val49*val33)+(val58*val36));
    acc8 = (acc8+(val41*val0)+(val49*val4)+(val58*val7)+(val42*val2)+(val50*val5)+(val59*val8)+(val43*val3)+(val51*val6)+(val60*val9));
    acc9 = (acc9+(val41*val10)+(val49*val13)+(val58*val16)+(val42*val11)+(val50*val14)+(val59*val17)+(val43*val12)+(val51*val15)+(val60*val18));
    acc10 = (acc10+(val41*val19)+(val49*val22)+(val58*val25)+(val42*val20)+(val50*val23)+(val59*val26)+(val43*val21)+(val51*val24)+(val60*val27));
    acc11 = (acc11+(val41*val28)+(val49*val31)+(val58*val34)+(val42*val29)+(val50*val32)+(val59*val35)+(val43*val30)+(val51*val33)+(val60*val36));
    acc12 = (acc12+(val43*val0)+(val51*val4)+(val60*val7)+(val44*val2)+(val52*val5)+(val61*val8)+(val45*val3)+(val53*val6)+(val62*val9));
    acc13 = (acc13+(val43*val10)+(val51*val13)+(val60*val16)+(val44*val11)+(val52*val14)+(val61*val17)+(val45*val12)+(val53*val15)+(val62*val18));
    acc14 = (acc14+(val43*val19)+(val51*val22)+(val60*val25)+(val44*val20)+(val52*val23)+(val61*val26)+(val45*val21)+(val53*val24)+(val62*val27));
    acc15 = (acc15+(val43*val28)+(val51*val31)+(val60*val34)+(val44*val29)+(val52*val32)+(val61*val35)+(val45*val30)+(val53*val33)+(val62*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast2 = bitcast<i32>(precast5);
  var val63 = data5[cast2];
  var val64 = data3[cast2];
  var val65 = data4[cast2];
  var val66 = data6[cast2];
  var alu21 = (cast2+1);
  var val67 = data5[alu21];
  var val68 = data3[alu21];
  var val69 = data4[alu21];
  var val70 = data6[alu21];
  var alu22 = (cast2+2);
  var val71 = data5[alu22];
  var val72 = data3[alu22];
  var val73 = data4[alu22];
  var val74 = data6[alu22];
  var alu23 = (cast2+3);
  var val75 = data5[alu23];
  var val76 = data3[alu23];
  var val77 = data4[alu23];
  var val78 = data6[alu23];
  var precast6 = (cast1<<3u);
  var precast7 = (cast0<<2u);
  var alu24 = (bitcast<i32>(precast7)+(lidx1*104)+(lidx0*43264)+bitcast<i32>(precast6)+(gidx1*832));
  var cast3 = (f32((1/sqrt((val63+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val67+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val71+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val75+(f16(0.001f)))))));
  var alu25 = (((acc0-val64)*val65*cast3)+val66);
  data0[alu24] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc1-val68)*val69*cast4)+val70);
  data0[(alu24+10816)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc2-val72)*val73*cast5)+val74);
  data0[(alu24+21632)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc3-val76)*val77*cast6)+val78);
  data0[(alu24+32448)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc4-val64)*val65*cast3)+val66);
  data0[(alu24+1)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc5-val68)*val69*cast4)+val70);
  data0[(alu24+10817)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc6-val72)*val73*cast5)+val74);
  data0[(alu24+21633)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc7-val76)*val77*cast6)+val78);
  data0[(alu24+32449)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc8-val64)*val65*cast3)+val66);
  data0[(alu24+2)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc9-val68)*val69*cast4)+val70);
  data0[(alu24+10818)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc10-val72)*val73*cast5)+val74);
  data0[(alu24+21634)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc11-val76)*val77*cast6)+val78);
  data0[(alu24+32450)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc12-val64)*val65*cast3)+val66);
  data0[(alu24+3)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc13-val68)*val69*cast4)+val70);
  data0[(alu24+10819)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc14-val72)*val73*cast5)+val74);
  data0[(alu24+21635)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
  var alu55 = (((acc15-val76)*val77*cast6)+val78);
  data0[(alu24+32451)] = (alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f)))));
}`;

const r_169_8_16_4_4_32 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = lidx1;
  var cast0 = bitcast<u32>(precast1);
  var precast3 = (bitcast<u32>(precast0)<<6u);
  var cast1 = bitcast<i32>(precast3);
  var precast4 = (cast0<<2u);
  var cast2 = bitcast<i32>(precast4);
  var val0 = data5[cast2];
  var val1 = data3[cast2];
  var val2 = data4[cast2];
  var val3 = data6[cast2];
  var precast5 = (cast0<<7u);
  var cast3 = bitcast<i32>(precast5);
  var val4 = data2[cast3];
  var precast6 = (bitcast<u32>(precast2)<<2u);
  var cast4 = bitcast<i32>(precast6);
  var alu0 = (cast1+cast4);
  var val5 = data1[alu0];
  var alu1 = (cast2+1);
  var val6 = data5[alu1];
  var val7 = data3[alu1];
  var val8 = data4[alu1];
  var val9 = data6[alu1];
  var alu2 = (cast2+2);
  var val10 = data5[alu2];
  var val11 = data3[alu2];
  var val12 = data4[alu2];
  var val13 = data6[alu2];
  var alu3 = (cast2+3);
  var val14 = data5[alu3];
  var val15 = data3[alu3];
  var val16 = data4[alu3];
  var val17 = data6[alu3];
  var val18 = data2[(cast3+1)];
  var val19 = data2[(cast3+2)];
  var val20 = data2[(cast3+3)];
  var val21 = data2[(cast3+4)];
  var val22 = data2[(cast3+5)];
  var val23 = data2[(cast3+6)];
  var val24 = data2[(cast3+7)];
  var val25 = data2[(cast3+8)];
  var val26 = data2[(cast3+9)];
  var val27 = data2[(cast3+10)];
  var val28 = data2[(cast3+11)];
  var val29 = data2[(cast3+12)];
  var val30 = data2[(cast3+13)];
  var val31 = data2[(cast3+14)];
  var val32 = data2[(cast3+15)];
  var val33 = data2[(cast3+16)];
  var val34 = data2[(cast3+17)];
  var val35 = data2[(cast3+18)];
  var val36 = data2[(cast3+19)];
  var val37 = data2[(cast3+20)];
  var val38 = data2[(cast3+21)];
  var val39 = data2[(cast3+22)];
  var val40 = data2[(cast3+23)];
  var val41 = data2[(cast3+24)];
  var val42 = data2[(cast3+25)];
  var val43 = data2[(cast3+26)];
  var val44 = data2[(cast3+27)];
  var val45 = data2[(cast3+28)];
  var val46 = data2[(cast3+29)];
  var val47 = data2[(cast3+30)];
  var val48 = data2[(cast3+31)];
  var val49 = data2[(cast3+32)];
  var val50 = data2[(cast3+33)];
  var val51 = data2[(cast3+34)];
  var val52 = data2[(cast3+35)];
  var val53 = data2[(cast3+36)];
  var val54 = data2[(cast3+37)];
  var val55 = data2[(cast3+38)];
  var val56 = data2[(cast3+39)];
  var val57 = data2[(cast3+40)];
  var val58 = data2[(cast3+41)];
  var val59 = data2[(cast3+42)];
  var val60 = data2[(cast3+43)];
  var val61 = data2[(cast3+44)];
  var val62 = data2[(cast3+45)];
  var val63 = data2[(cast3+46)];
  var val64 = data2[(cast3+47)];
  var val65 = data2[(cast3+48)];
  var val66 = data2[(cast3+49)];
  var val67 = data2[(cast3+50)];
  var val68 = data2[(cast3+51)];
  var val69 = data2[(cast3+52)];
  var val70 = data2[(cast3+53)];
  var val71 = data2[(cast3+54)];
  var val72 = data2[(cast3+55)];
  var val73 = data2[(cast3+56)];
  var val74 = data2[(cast3+57)];
  var val75 = data2[(cast3+58)];
  var val76 = data2[(cast3+59)];
  var val77 = data2[(cast3+60)];
  var val78 = data2[(cast3+61)];
  var val79 = data2[(cast3+62)];
  var val80 = data2[(cast3+63)];
  var val81 = data2[(cast3+64)];
  var val82 = data2[(cast3+65)];
  var val83 = data2[(cast3+66)];
  var val84 = data2[(cast3+67)];
  var val85 = data2[(cast3+68)];
  var val86 = data2[(cast3+69)];
  var val87 = data2[(cast3+70)];
  var val88 = data2[(cast3+71)];
  var val89 = data2[(cast3+72)];
  var val90 = data2[(cast3+73)];
  var val91 = data2[(cast3+74)];
  var val92 = data2[(cast3+75)];
  var val93 = data2[(cast3+76)];
  var val94 = data2[(cast3+77)];
  var val95 = data2[(cast3+78)];
  var val96 = data2[(cast3+79)];
  var val97 = data2[(cast3+80)];
  var val98 = data2[(cast3+81)];
  var val99 = data2[(cast3+82)];
  var val100 = data2[(cast3+83)];
  var val101 = data2[(cast3+84)];
  var val102 = data2[(cast3+85)];
  var val103 = data2[(cast3+86)];
  var val104 = data2[(cast3+87)];
  var val105 = data2[(cast3+88)];
  var val106 = data2[(cast3+89)];
  var val107 = data2[(cast3+90)];
  var val108 = data2[(cast3+91)];
  var val109 = data2[(cast3+92)];
  var val110 = data2[(cast3+93)];
  var val111 = data2[(cast3+94)];
  var val112 = data2[(cast3+95)];
  var val113 = data2[(cast3+96)];
  var val114 = data2[(cast3+97)];
  var val115 = data2[(cast3+98)];
  var val116 = data2[(cast3+99)];
  var val117 = data2[(cast3+100)];
  var val118 = data2[(cast3+101)];
  var val119 = data2[(cast3+102)];
  var val120 = data2[(cast3+103)];
  var val121 = data2[(cast3+104)];
  var val122 = data2[(cast3+105)];
  var val123 = data2[(cast3+106)];
  var val124 = data2[(cast3+107)];
  var val125 = data2[(cast3+108)];
  var val126 = data2[(cast3+109)];
  var val127 = data2[(cast3+110)];
  var val128 = data2[(cast3+111)];
  var val129 = data2[(cast3+112)];
  var val130 = data2[(cast3+113)];
  var val131 = data2[(cast3+114)];
  var val132 = data2[(cast3+115)];
  var val133 = data2[(cast3+116)];
  var val134 = data2[(cast3+117)];
  var val135 = data2[(cast3+118)];
  var val136 = data2[(cast3+119)];
  var val137 = data2[(cast3+120)];
  var val138 = data2[(cast3+121)];
  var val139 = data2[(cast3+122)];
  var val140 = data2[(cast3+123)];
  var val141 = data2[(cast3+124)];
  var val142 = data2[(cast3+125)];
  var val143 = data2[(cast3+126)];
  var val144 = data2[(cast3+127)];
  var val145 = data1[(alu0+1)];
  var val146 = data1[(alu0+2)];
  var val147 = data1[(alu0+3)];
  var val148 = data1[(alu0+10816)];
  var val149 = data1[(alu0+10817)];
  var val150 = data1[(alu0+10818)];
  var val151 = data1[(alu0+10819)];
  var val152 = data1[(alu0+21632)];
  var val153 = data1[(alu0+21633)];
  var val154 = data1[(alu0+21634)];
  var val155 = data1[(alu0+21635)];
  var val156 = data1[(alu0+32448)];
  var val157 = data1[(alu0+32449)];
  var val158 = data1[(alu0+32450)];
  var val159 = data1[(alu0+32451)];
  var val160 = data1[(alu0+43264)];
  var val161 = data1[(alu0+43265)];
  var val162 = data1[(alu0+43266)];
  var val163 = data1[(alu0+43267)];
  var val164 = data1[(alu0+54080)];
  var val165 = data1[(alu0+54081)];
  var val166 = data1[(alu0+54082)];
  var val167 = data1[(alu0+54083)];
  var val168 = data1[(alu0+64896)];
  var val169 = data1[(alu0+64897)];
  var val170 = data1[(alu0+64898)];
  var val171 = data1[(alu0+64899)];
  var val172 = data1[(alu0+75712)];
  var val173 = data1[(alu0+75713)];
  var val174 = data1[(alu0+75714)];
  var val175 = data1[(alu0+75715)];
  var val176 = data1[(alu0+86528)];
  var val177 = data1[(alu0+86529)];
  var val178 = data1[(alu0+86530)];
  var val179 = data1[(alu0+86531)];
  var val180 = data1[(alu0+97344)];
  var val181 = data1[(alu0+97345)];
  var val182 = data1[(alu0+97346)];
  var val183 = data1[(alu0+97347)];
  var val184 = data1[(alu0+108160)];
  var val185 = data1[(alu0+108161)];
  var val186 = data1[(alu0+108162)];
  var val187 = data1[(alu0+108163)];
  var val188 = data1[(alu0+118976)];
  var val189 = data1[(alu0+118977)];
  var val190 = data1[(alu0+118978)];
  var val191 = data1[(alu0+118979)];
  var val192 = data1[(alu0+129792)];
  var val193 = data1[(alu0+129793)];
  var val194 = data1[(alu0+129794)];
  var val195 = data1[(alu0+129795)];
  var val196 = data1[(alu0+140608)];
  var val197 = data1[(alu0+140609)];
  var val198 = data1[(alu0+140610)];
  var val199 = data1[(alu0+140611)];
  var val200 = data1[(alu0+151424)];
  var val201 = data1[(alu0+151425)];
  var val202 = data1[(alu0+151426)];
  var val203 = data1[(alu0+151427)];
  var val204 = data1[(alu0+162240)];
  var val205 = data1[(alu0+162241)];
  var val206 = data1[(alu0+162242)];
  var val207 = data1[(alu0+162243)];
  var val208 = data1[(alu0+173056)];
  var val209 = data1[(alu0+173057)];
  var val210 = data1[(alu0+173058)];
  var val211 = data1[(alu0+173059)];
  var val212 = data1[(alu0+183872)];
  var val213 = data1[(alu0+183873)];
  var val214 = data1[(alu0+183874)];
  var val215 = data1[(alu0+183875)];
  var val216 = data1[(alu0+194688)];
  var val217 = data1[(alu0+194689)];
  var val218 = data1[(alu0+194690)];
  var val219 = data1[(alu0+194691)];
  var val220 = data1[(alu0+205504)];
  var val221 = data1[(alu0+205505)];
  var val222 = data1[(alu0+205506)];
  var val223 = data1[(alu0+205507)];
  var val224 = data1[(alu0+216320)];
  var val225 = data1[(alu0+216321)];
  var val226 = data1[(alu0+216322)];
  var val227 = data1[(alu0+216323)];
  var val228 = data1[(alu0+227136)];
  var val229 = data1[(alu0+227137)];
  var val230 = data1[(alu0+227138)];
  var val231 = data1[(alu0+227139)];
  var val232 = data1[(alu0+237952)];
  var val233 = data1[(alu0+237953)];
  var val234 = data1[(alu0+237954)];
  var val235 = data1[(alu0+237955)];
  var val236 = data1[(alu0+248768)];
  var val237 = data1[(alu0+248769)];
  var val238 = data1[(alu0+248770)];
  var val239 = data1[(alu0+248771)];
  var val240 = data1[(alu0+259584)];
  var val241 = data1[(alu0+259585)];
  var val242 = data1[(alu0+259586)];
  var val243 = data1[(alu0+259587)];
  var val244 = data1[(alu0+270400)];
  var val245 = data1[(alu0+270401)];
  var val246 = data1[(alu0+270402)];
  var val247 = data1[(alu0+270403)];
  var val248 = data1[(alu0+281216)];
  var val249 = data1[(alu0+281217)];
  var val250 = data1[(alu0+281218)];
  var val251 = data1[(alu0+281219)];
  var val252 = data1[(alu0+292032)];
  var val253 = data1[(alu0+292033)];
  var val254 = data1[(alu0+292034)];
  var val255 = data1[(alu0+292035)];
  var val256 = data1[(alu0+302848)];
  var val257 = data1[(alu0+302849)];
  var val258 = data1[(alu0+302850)];
  var val259 = data1[(alu0+302851)];
  var val260 = data1[(alu0+313664)];
  var val261 = data1[(alu0+313665)];
  var val262 = data1[(alu0+313666)];
  var val263 = data1[(alu0+313667)];
  var val264 = data1[(alu0+324480)];
  var val265 = data1[(alu0+324481)];
  var val266 = data1[(alu0+324482)];
  var val267 = data1[(alu0+324483)];
  var val268 = data1[(alu0+335296)];
  var val269 = data1[(alu0+335297)];
  var val270 = data1[(alu0+335298)];
  var val271 = data1[(alu0+335299)];
  var alu4 = (cast4+cast1+(lidx0*43264));
  var cast5 = (f32((1/sqrt((val0+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val6+(f16(0.001f)))))));
  var cast7 = (f32((1/sqrt((val10+(f16(0.001f)))))));
  var cast8 = (f32((1/sqrt((val14+(f16(0.001f)))))));
  var alu5 = (((((val5*val4)+(val148*val18)+(val152*val19)+(val156*val20)+(val160*val21)+(val164*val22)+(val168*val23)+(val172*val24)+(val176*val25)+(val180*val26)+(val184*val27)+(val188*val28)+(val192*val29)+(val196*val30)+(val200*val31)+(val204*val32)+(val208*val33)+(val212*val34)+(val216*val35)+(val220*val36)+(val224*val37)+(val228*val38)+(val232*val39)+(val236*val40)+(val240*val41)+(val244*val42)+(val248*val43)+(val252*val44)+(val256*val45)+(val260*val46)+(val264*val47)+(val268*val48))-val1)*val2*cast5)+val3);
  data0[alu4] = (alu5*(1/(1.0f+exp2((alu5*-1.4426950408889634f)))));
  var alu7 = (((((val5*val49)+(val148*val50)+(val152*val51)+(val156*val52)+(val160*val53)+(val164*val54)+(val168*val55)+(val172*val56)+(val176*val57)+(val180*val58)+(val184*val59)+(val188*val60)+(val192*val61)+(val196*val62)+(val200*val63)+(val204*val64)+(val208*val65)+(val212*val66)+(val216*val67)+(val220*val68)+(val224*val69)+(val228*val70)+(val232*val71)+(val236*val72)+(val240*val73)+(val244*val74)+(val248*val75)+(val252*val76)+(val256*val77)+(val260*val78)+(val264*val79)+(val268*val80))-val7)*val8*cast6)+val9);
  data0[(alu4+10816)] = (alu7*(1/(1.0f+exp2((alu7*-1.4426950408889634f)))));
  var alu9 = (((((val5*val81)+(val148*val82)+(val152*val83)+(val156*val84)+(val160*val85)+(val164*val86)+(val168*val87)+(val172*val88)+(val176*val89)+(val180*val90)+(val184*val91)+(val188*val92)+(val192*val93)+(val196*val94)+(val200*val95)+(val204*val96)+(val208*val97)+(val212*val98)+(val216*val99)+(val220*val100)+(val224*val101)+(val228*val102)+(val232*val103)+(val236*val104)+(val240*val105)+(val244*val106)+(val248*val107)+(val252*val108)+(val256*val109)+(val260*val110)+(val264*val111)+(val268*val112))-val11)*val12*cast7)+val13);
  data0[(alu4+21632)] = (alu9*(1/(1.0f+exp2((alu9*-1.4426950408889634f)))));
  var alu11 = (((((val5*val113)+(val148*val114)+(val152*val115)+(val156*val116)+(val160*val117)+(val164*val118)+(val168*val119)+(val172*val120)+(val176*val121)+(val180*val122)+(val184*val123)+(val188*val124)+(val192*val125)+(val196*val126)+(val200*val127)+(val204*val128)+(val208*val129)+(val212*val130)+(val216*val131)+(val220*val132)+(val224*val133)+(val228*val134)+(val232*val135)+(val236*val136)+(val240*val137)+(val244*val138)+(val248*val139)+(val252*val140)+(val256*val141)+(val260*val142)+(val264*val143)+(val268*val144))-val15)*val16*cast8)+val17);
  data0[(alu4+32448)] = (alu11*(1/(1.0f+exp2((alu11*-1.4426950408889634f)))));
  var alu13 = (((((val145*val4)+(val149*val18)+(val153*val19)+(val157*val20)+(val161*val21)+(val165*val22)+(val169*val23)+(val173*val24)+(val177*val25)+(val181*val26)+(val185*val27)+(val189*val28)+(val193*val29)+(val197*val30)+(val201*val31)+(val205*val32)+(val209*val33)+(val213*val34)+(val217*val35)+(val221*val36)+(val225*val37)+(val229*val38)+(val233*val39)+(val237*val40)+(val241*val41)+(val245*val42)+(val249*val43)+(val253*val44)+(val257*val45)+(val261*val46)+(val265*val47)+(val269*val48))-val1)*val2*cast5)+val3);
  data0[(alu4+1)] = (alu13*(1/(1.0f+exp2((alu13*-1.4426950408889634f)))));
  var alu15 = (((((val145*val49)+(val149*val50)+(val153*val51)+(val157*val52)+(val161*val53)+(val165*val54)+(val169*val55)+(val173*val56)+(val177*val57)+(val181*val58)+(val185*val59)+(val189*val60)+(val193*val61)+(val197*val62)+(val201*val63)+(val205*val64)+(val209*val65)+(val213*val66)+(val217*val67)+(val221*val68)+(val225*val69)+(val229*val70)+(val233*val71)+(val237*val72)+(val241*val73)+(val245*val74)+(val249*val75)+(val253*val76)+(val257*val77)+(val261*val78)+(val265*val79)+(val269*val80))-val7)*val8*cast6)+val9);
  data0[(alu4+10817)] = (alu15*(1/(1.0f+exp2((alu15*-1.4426950408889634f)))));
  var alu17 = (((((val145*val81)+(val149*val82)+(val153*val83)+(val157*val84)+(val161*val85)+(val165*val86)+(val169*val87)+(val173*val88)+(val177*val89)+(val181*val90)+(val185*val91)+(val189*val92)+(val193*val93)+(val197*val94)+(val201*val95)+(val205*val96)+(val209*val97)+(val213*val98)+(val217*val99)+(val221*val100)+(val225*val101)+(val229*val102)+(val233*val103)+(val237*val104)+(val241*val105)+(val245*val106)+(val249*val107)+(val253*val108)+(val257*val109)+(val261*val110)+(val265*val111)+(val269*val112))-val11)*val12*cast7)+val13);
  data0[(alu4+21633)] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
  var alu19 = (((((val145*val113)+(val149*val114)+(val153*val115)+(val157*val116)+(val161*val117)+(val165*val118)+(val169*val119)+(val173*val120)+(val177*val121)+(val181*val122)+(val185*val123)+(val189*val124)+(val193*val125)+(val197*val126)+(val201*val127)+(val205*val128)+(val209*val129)+(val213*val130)+(val217*val131)+(val221*val132)+(val225*val133)+(val229*val134)+(val233*val135)+(val237*val136)+(val241*val137)+(val245*val138)+(val249*val139)+(val253*val140)+(val257*val141)+(val261*val142)+(val265*val143)+(val269*val144))-val15)*val16*cast8)+val17);
  data0[(alu4+32449)] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
  var alu21 = (((((val146*val4)+(val150*val18)+(val154*val19)+(val158*val20)+(val162*val21)+(val166*val22)+(val170*val23)+(val174*val24)+(val178*val25)+(val182*val26)+(val186*val27)+(val190*val28)+(val194*val29)+(val198*val30)+(val202*val31)+(val206*val32)+(val210*val33)+(val214*val34)+(val218*val35)+(val222*val36)+(val226*val37)+(val230*val38)+(val234*val39)+(val238*val40)+(val242*val41)+(val246*val42)+(val250*val43)+(val254*val44)+(val258*val45)+(val262*val46)+(val266*val47)+(val270*val48))-val1)*val2*cast5)+val3);
  data0[(alu4+2)] = (alu21*(1/(1.0f+exp2((alu21*-1.4426950408889634f)))));
  var alu23 = (((((val146*val49)+(val150*val50)+(val154*val51)+(val158*val52)+(val162*val53)+(val166*val54)+(val170*val55)+(val174*val56)+(val178*val57)+(val182*val58)+(val186*val59)+(val190*val60)+(val194*val61)+(val198*val62)+(val202*val63)+(val206*val64)+(val210*val65)+(val214*val66)+(val218*val67)+(val222*val68)+(val226*val69)+(val230*val70)+(val234*val71)+(val238*val72)+(val242*val73)+(val246*val74)+(val250*val75)+(val254*val76)+(val258*val77)+(val262*val78)+(val266*val79)+(val270*val80))-val7)*val8*cast6)+val9);
  data0[(alu4+10818)] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((((val146*val81)+(val150*val82)+(val154*val83)+(val158*val84)+(val162*val85)+(val166*val86)+(val170*val87)+(val174*val88)+(val178*val89)+(val182*val90)+(val186*val91)+(val190*val92)+(val194*val93)+(val198*val94)+(val202*val95)+(val206*val96)+(val210*val97)+(val214*val98)+(val218*val99)+(val222*val100)+(val226*val101)+(val230*val102)+(val234*val103)+(val238*val104)+(val242*val105)+(val246*val106)+(val250*val107)+(val254*val108)+(val258*val109)+(val262*val110)+(val266*val111)+(val270*val112))-val11)*val12*cast7)+val13);
  data0[(alu4+21634)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((((val146*val113)+(val150*val114)+(val154*val115)+(val158*val116)+(val162*val117)+(val166*val118)+(val170*val119)+(val174*val120)+(val178*val121)+(val182*val122)+(val186*val123)+(val190*val124)+(val194*val125)+(val198*val126)+(val202*val127)+(val206*val128)+(val210*val129)+(val214*val130)+(val218*val131)+(val222*val132)+(val226*val133)+(val230*val134)+(val234*val135)+(val238*val136)+(val242*val137)+(val246*val138)+(val250*val139)+(val254*val140)+(val258*val141)+(val262*val142)+(val266*val143)+(val270*val144))-val15)*val16*cast8)+val17);
  data0[(alu4+32450)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((((val147*val4)+(val151*val18)+(val155*val19)+(val159*val20)+(val163*val21)+(val167*val22)+(val171*val23)+(val175*val24)+(val179*val25)+(val183*val26)+(val187*val27)+(val191*val28)+(val195*val29)+(val199*val30)+(val203*val31)+(val207*val32)+(val211*val33)+(val215*val34)+(val219*val35)+(val223*val36)+(val227*val37)+(val231*val38)+(val235*val39)+(val239*val40)+(val243*val41)+(val247*val42)+(val251*val43)+(val255*val44)+(val259*val45)+(val263*val46)+(val267*val47)+(val271*val48))-val1)*val2*cast5)+val3);
  data0[(alu4+3)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((((val147*val49)+(val151*val50)+(val155*val51)+(val159*val52)+(val163*val53)+(val167*val54)+(val171*val55)+(val175*val56)+(val179*val57)+(val183*val58)+(val187*val59)+(val191*val60)+(val195*val61)+(val199*val62)+(val203*val63)+(val207*val64)+(val211*val65)+(val215*val66)+(val219*val67)+(val223*val68)+(val227*val69)+(val231*val70)+(val235*val71)+(val239*val72)+(val243*val73)+(val247*val74)+(val251*val75)+(val255*val76)+(val259*val77)+(val263*val78)+(val267*val79)+(val271*val80))-val7)*val8*cast6)+val9);
  data0[(alu4+10819)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((((val147*val81)+(val151*val82)+(val155*val83)+(val159*val84)+(val163*val85)+(val167*val86)+(val171*val87)+(val175*val88)+(val179*val89)+(val183*val90)+(val187*val91)+(val191*val92)+(val195*val93)+(val199*val94)+(val203*val95)+(val207*val96)+(val211*val97)+(val215*val98)+(val219*val99)+(val223*val100)+(val227*val101)+(val231*val102)+(val235*val103)+(val239*val104)+(val243*val105)+(val247*val106)+(val251*val107)+(val255*val108)+(val259*val109)+(val263*val110)+(val267*val111)+(val271*val112))-val11)*val12*cast7)+val13);
  data0[(alu4+21635)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((((val147*val113)+(val151*val114)+(val155*val115)+(val159*val116)+(val163*val117)+(val167*val118)+(val171*val119)+(val175*val120)+(val179*val121)+(val183*val122)+(val187*val123)+(val191*val124)+(val195*val125)+(val199*val126)+(val203*val127)+(val207*val128)+(val211*val129)+(val215*val130)+(val219*val131)+(val223*val132)+(val227*val133)+(val231*val134)+(val235*val135)+(val239*val136)+(val243*val137)+(val247*val138)+(val251*val139)+(val255*val140)+(val259*val141)+(val263*val142)+(val267*val143)+(val271*val144))-val15)*val16*cast8)+val17);
  data0[(alu4+32451)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
}`;

const r_13_13_4_8_2_16_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4,8,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 8 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = lidx2;
  var precast2 = (bitcast<u32>(precast1)<<2u);
  var cast1 = bitcast<i32>(precast2);
  var alu0 = (lidx1*104);
  var precast3 = (cast0<<3u);
  var cast2 = bitcast<i32>(precast3);
  var alu1 = (gidx1*832);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = (((gidx0+lidx2)<1)!=true);
  var precast4 = gidx1;
  var precast5 = (bitcast<u32>(precast4)<<3u);
  var alu4 = ((lidx1+bitcast<i32>(precast5))<103);
  var precast6 = (cast0<<1u);
  var alu5 = ((lidx2+bitcast<i32>(precast6))<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx5 = 0; ridx5 < 16; ridx5++) {
    var alu6 = ((lidx0*576)+(ridx5*9));
    var val0 = data2[alu6];
    var alu7 = (cast2+cast1+(ridx5*10816)+alu1+alu0);
    var val1 = data2[(alu6+1)];
    var val2 = data2[(alu6+2)];
    var val3 = data2[(alu6+3)];
    var val4 = data2[(alu6+4)];
    var val5 = data2[(alu6+5)];
    var val6 = data2[(alu6+6)];
    var val7 = data2[(alu6+7)];
    var val8 = data2[(alu6+8)];
    var val9 = data2[(alu6+144)];
    var val10 = data2[(alu6+145)];
    var val11 = data2[(alu6+146)];
    var val12 = data2[(alu6+147)];
    var val13 = data2[(alu6+148)];
    var val14 = data2[(alu6+149)];
    var val15 = data2[(alu6+150)];
    var val16 = data2[(alu6+151)];
    var val17 = data2[(alu6+152)];
    var val18 = data2[(alu6+288)];
    var val19 = data2[(alu6+289)];
    var val20 = data2[(alu6+290)];
    var val21 = data2[(alu6+291)];
    var val22 = data2[(alu6+292)];
    var val23 = data2[(alu6+293)];
    var val24 = data2[(alu6+294)];
    var val25 = data2[(alu6+295)];
    var val26 = data2[(alu6+296)];
    var val27 = data2[(alu6+432)];
    var val28 = data2[(alu6+433)];
    var val29 = data2[(alu6+434)];
    var val30 = data2[(alu6+435)];
    var val31 = data2[(alu6+436)];
    var val32 = data2[(alu6+437)];
    var val33 = data2[(alu6+438)];
    var val34 = data2[(alu6+439)];
    var val35 = data2[(alu6+440)];
    var val36 = select(0.0f, data1[(alu7+172951)], (alu2&alu3));
    var val37 = select(0.0f, data1[(alu7+172952)], alu2);
    var val38 = select(0.0f, data1[(alu7+172953)], alu2);
    var val39 = select(0.0f, data1[(alu7+172954)], alu2);
    var val40 = select(0.0f, data1[(alu7+172955)], alu2);
    var val41 = select(0.0f, data1[(alu7+172956)], (alu2&alu5));
    var val42 = select(0.0f, data1[(alu7+173055)], alu3);
    var val43 = data1[(alu7+173056)];
    var val44 = data1[(alu7+173057)];
    var val45 = data1[(alu7+173058)];
    var val46 = data1[(alu7+173059)];
    var val47 = select(0.0f, data1[(alu7+173060)], alu5);
    var val48 = select(0.0f, data1[(alu7+173159)], (alu4&alu3));
    var val49 = select(0.0f, data1[(alu7+173160)], alu4);
    var val50 = select(0.0f, data1[(alu7+173161)], alu4);
    var val51 = select(0.0f, data1[(alu7+173162)], alu4);
    var val52 = select(0.0f, data1[(alu7+173163)], alu4);
    var val53 = select(0.0f, data1[(alu7+173164)], (alu4&alu5));
    acc0 = (acc0+(val36*val0)+(val42*val3)+(val48*val6)+(val37*val1)+(val43*val4)+(val49*val7)+(val38*val2)+(val44*val5)+(val50*val8));
    acc1 = (acc1+(val36*val9)+(val42*val12)+(val48*val15)+(val37*val10)+(val43*val13)+(val49*val16)+(val38*val11)+(val44*val14)+(val50*val17));
    acc2 = (acc2+(val36*val18)+(val42*val21)+(val48*val24)+(val37*val19)+(val43*val22)+(val49*val25)+(val38*val20)+(val44*val23)+(val50*val26));
    acc3 = (acc3+(val36*val27)+(val42*val30)+(val48*val33)+(val37*val28)+(val43*val31)+(val49*val34)+(val38*val29)+(val44*val32)+(val50*val35));
    acc4 = (acc4+(val37*val0)+(val43*val3)+(val49*val6)+(val38*val1)+(val44*val4)+(val50*val7)+(val39*val2)+(val45*val5)+(val51*val8));
    acc5 = (acc5+(val37*val9)+(val43*val12)+(val49*val15)+(val38*val10)+(val44*val13)+(val50*val16)+(val39*val11)+(val45*val14)+(val51*val17));
    acc6 = (acc6+(val37*val18)+(val43*val21)+(val49*val24)+(val38*val19)+(val44*val22)+(val50*val25)+(val39*val20)+(val45*val23)+(val51*val26));
    acc7 = (acc7+(val37*val27)+(val43*val30)+(val49*val33)+(val38*val28)+(val44*val31)+(val50*val34)+(val39*val29)+(val45*val32)+(val51*val35));
    acc8 = (acc8+(val38*val0)+(val44*val3)+(val50*val6)+(val39*val1)+(val45*val4)+(val51*val7)+(val40*val2)+(val46*val5)+(val52*val8));
    acc9 = (acc9+(val38*val9)+(val44*val12)+(val50*val15)+(val39*val10)+(val45*val13)+(val51*val16)+(val40*val11)+(val46*val14)+(val52*val17));
    acc10 = (acc10+(val38*val18)+(val44*val21)+(val50*val24)+(val39*val19)+(val45*val22)+(val51*val25)+(val40*val20)+(val46*val23)+(val52*val26));
    acc11 = (acc11+(val38*val27)+(val44*val30)+(val50*val33)+(val39*val28)+(val45*val31)+(val51*val34)+(val40*val29)+(val46*val32)+(val52*val35));
    acc12 = (acc12+(val39*val0)+(val45*val3)+(val51*val6)+(val40*val1)+(val46*val4)+(val52*val7)+(val41*val2)+(val47*val5)+(val53*val8));
    acc13 = (acc13+(val39*val9)+(val45*val12)+(val51*val15)+(val40*val10)+(val46*val13)+(val52*val16)+(val41*val11)+(val47*val14)+(val53*val17));
    acc14 = (acc14+(val39*val18)+(val45*val21)+(val51*val24)+(val40*val19)+(val46*val22)+(val52*val25)+(val41*val20)+(val47*val23)+(val53*val26));
    acc15 = (acc15+(val39*val27)+(val45*val30)+(val51*val33)+(val40*val28)+(val46*val31)+(val52*val34)+(val41*val29)+(val47*val32)+(val53*val35));
  }
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast7)<<2u);
  var cast3 = bitcast<i32>(precast8);
  var val54 = data5[cast3];
  var val55 = data3[cast3];
  var val56 = data4[cast3];
  var val57 = data6[cast3];
  var alu25 = (cast3+1);
  var val58 = data5[alu25];
  var val59 = data3[alu25];
  var val60 = data4[alu25];
  var val61 = data6[alu25];
  var alu26 = (cast3+2);
  var val62 = data5[alu26];
  var val63 = data3[alu26];
  var val64 = data4[alu26];
  var val65 = data6[alu26];
  var alu27 = (cast3+3);
  var val66 = data5[alu27];
  var val67 = data3[alu27];
  var val68 = data4[alu27];
  var val69 = data6[alu27];
  var alu28 = (cast1+alu0+(lidx0*43264)+cast2+alu1);
  var cast4 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast7 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu29 = (((acc0-val55)*val56*cast4)+val57);
  data0[alu28] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc1-val59)*val60*cast5)+val61);
  data0[(alu28+10816)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc2-val63)*val64*cast6)+val65);
  data0[(alu28+21632)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc3-val67)*val68*cast7)+val69);
  data0[(alu28+32448)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc4-val55)*val56*cast4)+val57);
  data0[(alu28+1)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc5-val59)*val60*cast5)+val61);
  data0[(alu28+10817)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc6-val63)*val64*cast6)+val65);
  data0[(alu28+21633)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc7-val67)*val68*cast7)+val69);
  data0[(alu28+32449)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc8-val55)*val56*cast4)+val57);
  data0[(alu28+2)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc9-val59)*val60*cast5)+val61);
  data0[(alu28+10818)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc10-val63)*val64*cast6)+val65);
  data0[(alu28+21634)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc11-val67)*val68*cast7)+val69);
  data0[(alu28+32450)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc12-val55)*val56*cast4)+val57);
  data0[(alu28+3)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
  var alu55 = (((acc13-val59)*val60*cast5)+val61);
  data0[(alu28+10819)] = (alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f)))));
  var alu57 = (((acc14-val63)*val64*cast6)+val65);
  data0[(alu28+21635)] = (alu57*(1/(1.0f+exp2((alu57*-1.4426950408889634f)))));
  var alu59 = (((acc15-val67)*val68*cast7)+val69);
  data0[(alu28+32451)] = (alu59*(1/(1.0f+exp2((alu59*-1.4426950408889634f)))));
}`;

const r_13_13_4_8_2_16_4_4_3_3n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f16>;
@group(0) @binding(8)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(4,8,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 8 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = lidx2;
  var precast2 = (bitcast<u32>(precast1)<<2u);
  var cast1 = bitcast<i32>(precast2);
  var alu0 = (lidx1*104);
  var precast3 = (cast0<<3u);
  var cast2 = bitcast<i32>(precast3);
  var alu1 = (gidx1*832);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = (((gidx0+lidx2)<1)!=true);
  var precast4 = gidx1;
  var precast5 = (bitcast<u32>(precast4)<<3u);
  var alu4 = ((lidx1+bitcast<i32>(precast5))<103);
  var precast6 = (cast0<<1u);
  var alu5 = ((lidx2+bitcast<i32>(precast6))<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx5 = 0; ridx5 < 16; ridx5++) {
    var alu6 = ((lidx0*576)+(ridx5*9));
    var val0 = data3[alu6];
    var alu7 = (cast2+cast1+(ridx5*10816)+alu1+alu0);
    var val1 = data2[alu7];
    var val2 = data3[(alu6+1)];
    var val3 = data3[(alu6+2)];
    var val4 = data3[(alu6+3)];
    var val5 = data3[(alu6+4)];
    var val6 = data3[(alu6+5)];
    var val7 = data3[(alu6+6)];
    var val8 = data3[(alu6+7)];
    var val9 = data3[(alu6+8)];
    var val10 = data3[(alu6+144)];
    var val11 = data3[(alu6+145)];
    var val12 = data3[(alu6+146)];
    var val13 = data3[(alu6+147)];
    var val14 = data3[(alu6+148)];
    var val15 = data3[(alu6+149)];
    var val16 = data3[(alu6+150)];
    var val17 = data3[(alu6+151)];
    var val18 = data3[(alu6+152)];
    var val19 = data3[(alu6+288)];
    var val20 = data3[(alu6+289)];
    var val21 = data3[(alu6+290)];
    var val22 = data3[(alu6+291)];
    var val23 = data3[(alu6+292)];
    var val24 = data3[(alu6+293)];
    var val25 = data3[(alu6+294)];
    var val26 = data3[(alu6+295)];
    var val27 = data3[(alu6+296)];
    var val28 = data3[(alu6+432)];
    var val29 = data3[(alu6+433)];
    var val30 = data3[(alu6+434)];
    var val31 = data3[(alu6+435)];
    var val32 = data3[(alu6+436)];
    var val33 = data3[(alu6+437)];
    var val34 = data3[(alu6+438)];
    var val35 = data3[(alu6+439)];
    var val36 = data3[(alu6+440)];
    var val37 = select(0.0f, data2[(alu7+-105)], (alu2&alu3));
    var val38 = select(0.0f, data2[(alu7+-104)], alu2);
    var val39 = select(0.0f, data2[(alu7+-103)], alu2);
    var val40 = select(0.0f, data2[(alu7+-102)], alu2);
    var val41 = select(0.0f, data2[(alu7+-101)], alu2);
    var val42 = select(0.0f, data2[(alu7+-100)], (alu2&alu5));
    var val43 = select(0.0f, data2[(alu7+-1)], alu3);
    var val44 = data2[(alu7+1)];
    var val45 = data2[(alu7+2)];
    var val46 = data2[(alu7+3)];
    var val47 = select(0.0f, data2[(alu7+4)], alu5);
    var val48 = select(0.0f, data2[(alu7+103)], (alu4&alu3));
    var val49 = select(0.0f, data2[(alu7+104)], alu4);
    var val50 = select(0.0f, data2[(alu7+105)], alu4);
    var val51 = select(0.0f, data2[(alu7+106)], alu4);
    var val52 = select(0.0f, data2[(alu7+107)], alu4);
    var val53 = select(0.0f, data2[(alu7+108)], (alu4&alu5));
    acc0 = (acc0+(val37*val0)+(val43*val4)+(val48*val7)+(val38*val2)+(val1*val5)+(val49*val8)+(val39*val3)+(val44*val6)+(val50*val9));
    acc1 = (acc1+(val37*val10)+(val43*val13)+(val48*val16)+(val38*val11)+(val1*val14)+(val49*val17)+(val39*val12)+(val44*val15)+(val50*val18));
    acc2 = (acc2+(val37*val19)+(val43*val22)+(val48*val25)+(val38*val20)+(val1*val23)+(val49*val26)+(val39*val21)+(val44*val24)+(val50*val27));
    acc3 = (acc3+(val37*val28)+(val43*val31)+(val48*val34)+(val38*val29)+(val1*val32)+(val49*val35)+(val39*val30)+(val44*val33)+(val50*val36));
    acc4 = (acc4+(val38*val0)+(val1*val4)+(val49*val7)+(val39*val2)+(val44*val5)+(val50*val8)+(val40*val3)+(val45*val6)+(val51*val9));
    acc5 = (acc5+(val38*val10)+(val1*val13)+(val49*val16)+(val39*val11)+(val44*val14)+(val50*val17)+(val40*val12)+(val45*val15)+(val51*val18));
    acc6 = (acc6+(val38*val19)+(val1*val22)+(val49*val25)+(val39*val20)+(val44*val23)+(val50*val26)+(val40*val21)+(val45*val24)+(val51*val27));
    acc7 = (acc7+(val38*val28)+(val1*val31)+(val49*val34)+(val39*val29)+(val44*val32)+(val50*val35)+(val40*val30)+(val45*val33)+(val51*val36));
    acc8 = (acc8+(val39*val0)+(val44*val4)+(val50*val7)+(val40*val2)+(val45*val5)+(val51*val8)+(val41*val3)+(val46*val6)+(val52*val9));
    acc9 = (acc9+(val39*val10)+(val44*val13)+(val50*val16)+(val40*val11)+(val45*val14)+(val51*val17)+(val41*val12)+(val46*val15)+(val52*val18));
    acc10 = (acc10+(val39*val19)+(val44*val22)+(val50*val25)+(val40*val20)+(val45*val23)+(val51*val26)+(val41*val21)+(val46*val24)+(val52*val27));
    acc11 = (acc11+(val39*val28)+(val44*val31)+(val50*val34)+(val40*val29)+(val45*val32)+(val51*val35)+(val41*val30)+(val46*val33)+(val52*val36));
    acc12 = (acc12+(val40*val0)+(val45*val4)+(val51*val7)+(val41*val2)+(val46*val5)+(val52*val8)+(val42*val3)+(val47*val6)+(val53*val9));
    acc13 = (acc13+(val40*val10)+(val45*val13)+(val51*val16)+(val41*val11)+(val46*val14)+(val52*val17)+(val42*val12)+(val47*val15)+(val53*val18));
    acc14 = (acc14+(val40*val19)+(val45*val22)+(val51*val25)+(val41*val20)+(val46*val23)+(val52*val26)+(val42*val21)+(val47*val24)+(val53*val27));
    acc15 = (acc15+(val40*val28)+(val45*val31)+(val51*val34)+(val41*val29)+(val46*val32)+(val52*val35)+(val42*val30)+(val47*val33)+(val53*val36));
  }
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast7)<<2u);
  var cast3 = bitcast<i32>(precast8);
  var val54 = data6[cast3];
  var val55 = data4[cast3];
  var val56 = data5[cast3];
  var val57 = data7[cast3];
  var alu25 = (cast3+1);
  var val58 = data6[alu25];
  var val59 = data4[alu25];
  var val60 = data5[alu25];
  var val61 = data7[alu25];
  var alu26 = (cast3+2);
  var val62 = data6[alu26];
  var val63 = data4[alu26];
  var val64 = data5[alu26];
  var val65 = data7[alu26];
  var alu27 = (cast3+3);
  var val66 = data6[alu27];
  var val67 = data4[alu27];
  var val68 = data5[alu27];
  var val69 = data7[alu27];
  var alu28 = (cast1+alu0+(lidx0*43264)+cast2+alu1);
  var val70 = data1[(alu28+173056)];
  var val71 = data1[(alu28+173057)];
  var val72 = data1[(alu28+173058)];
  var val73 = data1[(alu28+173059)];
  var val74 = data1[(alu28+183872)];
  var val75 = data1[(alu28+183873)];
  var val76 = data1[(alu28+183874)];
  var val77 = data1[(alu28+183875)];
  var val78 = data1[(alu28+194688)];
  var val79 = data1[(alu28+194689)];
  var val80 = data1[(alu28+194690)];
  var val81 = data1[(alu28+194691)];
  var val82 = data1[(alu28+205504)];
  var val83 = data1[(alu28+205505)];
  var val84 = data1[(alu28+205506)];
  var val85 = data1[(alu28+205507)];
  var cast4 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast7 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu29 = (((acc0-val55)*val56*cast4)+val57);
  data0[alu28] = (val70+(alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f))))));
  var alu31 = (((acc1-val59)*val60*cast5)+val61);
  data0[(alu28+10816)] = (val74+(alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f))))));
  var alu33 = (((acc2-val63)*val64*cast6)+val65);
  data0[(alu28+21632)] = (val78+(alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f))))));
  var alu35 = (((acc3-val67)*val68*cast7)+val69);
  data0[(alu28+32448)] = (val82+(alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f))))));
  var alu37 = (((acc4-val55)*val56*cast4)+val57);
  data0[(alu28+1)] = (val71+(alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f))))));
  var alu39 = (((acc5-val59)*val60*cast5)+val61);
  data0[(alu28+10817)] = (val75+(alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f))))));
  var alu41 = (((acc6-val63)*val64*cast6)+val65);
  data0[(alu28+21633)] = (val79+(alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f))))));
  var alu43 = (((acc7-val67)*val68*cast7)+val69);
  data0[(alu28+32449)] = (val83+(alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f))))));
  var alu45 = (((acc8-val55)*val56*cast4)+val57);
  data0[(alu28+2)] = (val72+(alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f))))));
  var alu47 = (((acc9-val59)*val60*cast5)+val61);
  data0[(alu28+10818)] = (val76+(alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f))))));
  var alu49 = (((acc10-val63)*val64*cast6)+val65);
  data0[(alu28+21634)] = (val80+(alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f))))));
  var alu51 = (((acc11-val67)*val68*cast7)+val69);
  data0[(alu28+32450)] = (val84+(alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f))))));
  var alu53 = (((acc12-val55)*val56*cast4)+val57);
  data0[(alu28+3)] = (val73+(alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f))))));
  var alu55 = (((acc13-val59)*val60*cast5)+val61);
  data0[(alu28+10819)] = (val77+(alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f))))));
  var alu57 = (((acc14-val63)*val64*cast6)+val65);
  data0[(alu28+21635)] = (val81+(alu57*(1/(1.0f+exp2((alu57*-1.4426950408889634f))))));
  var alu59 = (((acc15-val67)*val68*cast7)+val69);
  data0[(alu28+32451)] = (val85+(alu59*(1/(1.0f+exp2((alu59*-1.4426950408889634f))))));
}`;

const E_6_169_8_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 6 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx1;
  var precast2 = (bitcast<u32>(precast0)<<6u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (bitcast<i32>(precast3)+(lidx0*10816)+bitcast<i32>(precast2)+(gidx1*86528));
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var alu3 = (alu0+3);
  var alu4 = (gidx1<2);
  var val0 = select(0.0f, data1[alu0], alu4);
  var val1 = select(0.0f, data1[alu1], alu4);
  var val2 = select(0.0f, data1[alu2], alu4);
  var val3 = select(0.0f, data1[alu3], alu4);
  var alu5 = (gidx1<4);
  var alu6 = (alu5!=true);
  var val4 = select(0.0f, data2[(alu0+-346112)], alu6);
  var val5 = select(0.0f, data2[(alu0+-346111)], alu6);
  var val6 = select(0.0f, data2[(alu0+-346110)], alu6);
  var val7 = select(0.0f, data2[(alu0+-346109)], alu6);
  var alu7 = ((alu4!=true)&alu5);
  var val8 = select(0.0f, data1[alu0], alu7);
  var val9 = select(0.0f, data1[alu1], alu7);
  var val10 = select(0.0f, data1[alu2], alu7);
  var val11 = select(0.0f, data1[alu3], alu7);
  data0[alu0] = (val0+val8+val4);
  data0[alu1] = (val1+val9+val5);
  data0[alu2] = (val2+val10+val6);
  data0[alu3] = (val3+val11+val7);
}`;

const r_169_8_16_12_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<6u);
  var cast1 = bitcast<i32>(precast3);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 12; ridx3++) {
    var precast4 = ridx3;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = ((lidx0*192)+bitcast<i32>(precast5));
    var val0 = data2[alu0];
    var alu1 = ((ridx3*43264)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+48)];
    var val6 = data2[(alu0+49)];
    var val7 = data2[(alu0+50)];
    var val8 = data2[(alu0+51)];
    var val9 = data2[(alu0+96)];
    var val10 = data2[(alu0+97)];
    var val11 = data2[(alu0+98)];
    var val12 = data2[(alu0+99)];
    var val13 = data2[(alu0+144)];
    var val14 = data2[(alu0+145)];
    var val15 = data2[(alu0+146)];
    var val16 = data2[(alu0+147)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+10816)];
    var val21 = data1[(alu1+10817)];
    var val22 = data1[(alu1+10818)];
    var val23 = data1[(alu1+10819)];
    var val24 = data1[(alu1+21632)];
    var val25 = data1[(alu1+21633)];
    var val26 = data1[(alu1+21634)];
    var val27 = data1[(alu1+21635)];
    var val28 = data1[(alu1+32448)];
    var val29 = data1[(alu1+32449)];
    var val30 = data1[(alu1+32450)];
    var val31 = data1[(alu1+32451)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast6 = lidx0;
  var precast7 = (bitcast<u32>(precast6)<<2u);
  var cast2 = bitcast<i32>(precast7);
  var val32 = data5[cast2];
  var val33 = data3[cast2];
  var val34 = data4[cast2];
  var val35 = data6[cast2];
  var alu19 = (cast2+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast2+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast2+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+cast1+(lidx0*43264));
  var cast3 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast3)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast4)+val39);
  data0[(alu22+10816)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast5)+val43);
  data0[(alu22+21632)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast6)+val47);
  data0[(alu22+32448)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast3)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast4)+val39);
  data0[(alu22+10817)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast5)+val43);
  data0[(alu22+21633)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast6)+val47);
  data0[(alu22+32449)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast3)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast4)+val39);
  data0[(alu22+10818)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast5)+val43);
  data0[(alu22+21634)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast6)+val47);
  data0[(alu22+32450)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast3)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast4)+val39);
  data0[(alu22+10819)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast5)+val43);
  data0[(alu22+21635)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast6)+val47);
  data0[(alu22+32451)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const r_13_13_16_4_32_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var cast0 = bitcast<u32>(precast0);
  var alu0 = (((gidx1+lidx1)<1)!=true);
  var alu1 = ((gidx0<1)!=true);
  var precast1 = (cast0<<3u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 32; ridx4++) {
    var alu2 = ((lidx0*1152)+(ridx4*9));
    var val0 = data2[alu2];
    var alu3 = (bitcast<i32>(precast1)+(ridx4*10816)+(gidx1*832)+(lidx1*208));
    var val1 = data1[alu3];
    var val2 = select(0.0f, data1[(alu3+-105)], (alu0&alu1));
    var val3 = select(0.0f, data1[(alu3+-104)], alu0);
    var val4 = select(0.0f, data1[(alu3+-103)], alu0);
    var val5 = select(0.0f, data1[(alu3+-102)], alu0);
    var val6 = select(0.0f, data1[(alu3+-101)], alu0);
    var val7 = select(0.0f, data1[(alu3+-100)], alu0);
    var val8 = select(0.0f, data1[(alu3+-99)], alu0);
    var val9 = select(0.0f, data1[(alu3+-98)], alu0);
    var val10 = select(0.0f, data1[(alu3+-97)], alu0);
    var val11 = select(0.0f, data1[(alu3+-1)], alu1);
    var val12 = data1[(alu3+1)];
    var val13 = data1[(alu3+2)];
    var val14 = data1[(alu3+3)];
    var val15 = data1[(alu3+4)];
    var val16 = data1[(alu3+5)];
    var val17 = data1[(alu3+6)];
    var val18 = data1[(alu3+7)];
    var val19 = select(0.0f, data1[(alu3+103)], alu1);
    var val20 = data1[(alu3+104)];
    var val21 = data1[(alu3+105)];
    var val22 = data1[(alu3+106)];
    var val23 = data1[(alu3+107)];
    var val24 = data1[(alu3+108)];
    var val25 = data1[(alu3+109)];
    var val26 = data1[(alu3+110)];
    var val27 = data1[(alu3+111)];
    var val28 = data2[(alu2+1)];
    var val29 = data2[(alu2+2)];
    var val30 = data2[(alu2+3)];
    var val31 = data2[(alu2+4)];
    var val32 = data2[(alu2+5)];
    var val33 = data2[(alu2+6)];
    var val34 = data2[(alu2+7)];
    var val35 = data2[(alu2+8)];
    var val36 = data2[(alu2+288)];
    var val37 = data2[(alu2+289)];
    var val38 = data2[(alu2+290)];
    var val39 = data2[(alu2+291)];
    var val40 = data2[(alu2+292)];
    var val41 = data2[(alu2+293)];
    var val42 = data2[(alu2+294)];
    var val43 = data2[(alu2+295)];
    var val44 = data2[(alu2+296)];
    var val45 = data2[(alu2+576)];
    var val46 = data2[(alu2+577)];
    var val47 = data2[(alu2+578)];
    var val48 = data2[(alu2+579)];
    var val49 = data2[(alu2+580)];
    var val50 = data2[(alu2+581)];
    var val51 = data2[(alu2+582)];
    var val52 = data2[(alu2+583)];
    var val53 = data2[(alu2+584)];
    var val54 = data2[(alu2+864)];
    var val55 = data2[(alu2+865)];
    var val56 = data2[(alu2+866)];
    var val57 = data2[(alu2+867)];
    var val58 = data2[(alu2+868)];
    var val59 = data2[(alu2+869)];
    var val60 = data2[(alu2+870)];
    var val61 = data2[(alu2+871)];
    var val62 = data2[(alu2+872)];
    acc0 = (acc0+(val2*val0)+(val11*val30)+(val19*val33)+(val3*val28)+(val1*val31)+(val20*val34)+(val4*val29)+(val12*val32)+(val21*val35));
    acc1 = (acc1+(val2*val36)+(val11*val39)+(val19*val42)+(val3*val37)+(val1*val40)+(val20*val43)+(val4*val38)+(val12*val41)+(val21*val44));
    acc2 = (acc2+(val2*val45)+(val11*val48)+(val19*val51)+(val3*val46)+(val1*val49)+(val20*val52)+(val4*val47)+(val12*val50)+(val21*val53));
    acc3 = (acc3+(val2*val54)+(val11*val57)+(val19*val60)+(val3*val55)+(val1*val58)+(val20*val61)+(val4*val56)+(val12*val59)+(val21*val62));
    acc4 = (acc4+(val4*val0)+(val12*val30)+(val21*val33)+(val5*val28)+(val13*val31)+(val22*val34)+(val6*val29)+(val14*val32)+(val23*val35));
    acc5 = (acc5+(val4*val36)+(val12*val39)+(val21*val42)+(val5*val37)+(val13*val40)+(val22*val43)+(val6*val38)+(val14*val41)+(val23*val44));
    acc6 = (acc6+(val4*val45)+(val12*val48)+(val21*val51)+(val5*val46)+(val13*val49)+(val22*val52)+(val6*val47)+(val14*val50)+(val23*val53));
    acc7 = (acc7+(val4*val54)+(val12*val57)+(val21*val60)+(val5*val55)+(val13*val58)+(val22*val61)+(val6*val56)+(val14*val59)+(val23*val62));
    acc8 = (acc8+(val6*val0)+(val14*val30)+(val23*val33)+(val7*val28)+(val15*val31)+(val24*val34)+(val8*val29)+(val16*val32)+(val25*val35));
    acc9 = (acc9+(val6*val36)+(val14*val39)+(val23*val42)+(val7*val37)+(val15*val40)+(val24*val43)+(val8*val38)+(val16*val41)+(val25*val44));
    acc10 = (acc10+(val6*val45)+(val14*val48)+(val23*val51)+(val7*val46)+(val15*val49)+(val24*val52)+(val8*val47)+(val16*val50)+(val25*val53));
    acc11 = (acc11+(val6*val54)+(val14*val57)+(val23*val60)+(val7*val55)+(val15*val58)+(val24*val61)+(val8*val56)+(val16*val59)+(val25*val62));
    acc12 = (acc12+(val8*val0)+(val16*val30)+(val25*val33)+(val9*val28)+(val17*val31)+(val26*val34)+(val10*val29)+(val18*val32)+(val27*val35));
    acc13 = (acc13+(val8*val36)+(val16*val39)+(val25*val42)+(val9*val37)+(val17*val40)+(val26*val43)+(val10*val38)+(val18*val41)+(val27*val44));
    acc14 = (acc14+(val8*val45)+(val16*val48)+(val25*val51)+(val9*val46)+(val17*val49)+(val26*val52)+(val10*val47)+(val18*val50)+(val27*val53));
    acc15 = (acc15+(val8*val54)+(val16*val57)+(val25*val60)+(val9*val55)+(val17*val58)+(val26*val61)+(val10*val56)+(val18*val59)+(val27*val62));
  }
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var cast1 = bitcast<i32>(precast3);
  var val63 = data5[cast1];
  var val64 = data3[cast1];
  var val65 = data4[cast1];
  var val66 = data6[cast1];
  var alu21 = (cast1+1);
  var val67 = data5[alu21];
  var val68 = data3[alu21];
  var val69 = data4[alu21];
  var val70 = data6[alu21];
  var alu22 = (cast1+2);
  var val71 = data5[alu22];
  var val72 = data3[alu22];
  var val73 = data4[alu22];
  var val74 = data6[alu22];
  var alu23 = (cast1+3);
  var val75 = data5[alu23];
  var val76 = data3[alu23];
  var val77 = data4[alu23];
  var val78 = data6[alu23];
  var precast4 = (cast0<<2u);
  var alu24 = ((lidx1*52)+(lidx0*10816)+bitcast<i32>(precast4)+(gidx1*208));
  var cast2 = (f32((1/sqrt((val63+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val67+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val71+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val75+(f16(0.001f)))))));
  var alu25 = (((acc0-val64)*val65*cast2)+val66);
  data0[alu24] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc1-val68)*val69*cast3)+val70);
  data0[(alu24+2704)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc2-val72)*val73*cast4)+val74);
  data0[(alu24+5408)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc3-val76)*val77*cast5)+val78);
  data0[(alu24+8112)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc4-val64)*val65*cast2)+val66);
  data0[(alu24+1)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc5-val68)*val69*cast3)+val70);
  data0[(alu24+2705)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc6-val72)*val73*cast4)+val74);
  data0[(alu24+5409)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc7-val76)*val77*cast5)+val78);
  data0[(alu24+8113)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc8-val64)*val65*cast2)+val66);
  data0[(alu24+2)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc9-val68)*val69*cast3)+val70);
  data0[(alu24+2706)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc10-val72)*val73*cast4)+val74);
  data0[(alu24+5410)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc11-val76)*val77*cast5)+val78);
  data0[(alu24+8114)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc12-val64)*val65*cast2)+val66);
  data0[(alu24+3)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc13-val68)*val69*cast3)+val70);
  data0[(alu24+2707)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc14-val72)*val73*cast4)+val74);
  data0[(alu24+5411)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
  var alu55 = (((acc15-val76)*val77*cast5)+val78);
  data0[(alu24+8115)] = (alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f)))));
}`;

const r_169_16_4_16_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  var cast1 = bitcast<i32>(precast3);
  var precast4 = lidx0;
  var cast2 = bitcast<u32>(precast4);
  var precast5 = (cast2<<8u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 16; ridx3++) {
    var precast6 = ridx3;
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu0 = (bitcast<i32>(precast5)+bitcast<i32>(precast7));
    var val0 = data2[alu0];
    var alu1 = ((ridx3*10816)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+64)];
    var val6 = data2[(alu0+65)];
    var val7 = data2[(alu0+66)];
    var val8 = data2[(alu0+67)];
    var val9 = data2[(alu0+128)];
    var val10 = data2[(alu0+129)];
    var val11 = data2[(alu0+130)];
    var val12 = data2[(alu0+131)];
    var val13 = data2[(alu0+192)];
    var val14 = data2[(alu0+193)];
    var val15 = data2[(alu0+194)];
    var val16 = data2[(alu0+195)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+2704)];
    var val21 = data1[(alu1+2705)];
    var val22 = data1[(alu1+2706)];
    var val23 = data1[(alu1+2707)];
    var val24 = data1[(alu1+5408)];
    var val25 = data1[(alu1+5409)];
    var val26 = data1[(alu1+5410)];
    var val27 = data1[(alu1+5411)];
    var val28 = data1[(alu1+8112)];
    var val29 = data1[(alu1+8113)];
    var val30 = data1[(alu1+8114)];
    var val31 = data1[(alu1+8115)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast8 = (cast2<<2u);
  var cast3 = bitcast<i32>(precast8);
  var val32 = data5[cast3];
  var val33 = data3[cast3];
  var val34 = data4[cast3];
  var val35 = data6[cast3];
  var alu19 = (cast3+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast3+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast3+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+cast1+(lidx0*10816));
  var cast4 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast7 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast4)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast5)+val39);
  data0[(alu22+2704)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast6)+val43);
  data0[(alu22+5408)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast7)+val47);
  data0[(alu22+8112)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast4)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast5)+val39);
  data0[(alu22+2705)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast6)+val43);
  data0[(alu22+5409)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast7)+val47);
  data0[(alu22+8113)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast4)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast5)+val39);
  data0[(alu22+2706)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast6)+val43);
  data0[(alu22+5410)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast7)+val47);
  data0[(alu22+8114)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast4)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast5)+val39);
  data0[(alu22+2707)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast6)+val43);
  data0[(alu22+5411)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast7)+val47);
  data0[(alu22+8115)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const r_13_13_8_4_32_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 32; ridx4++) {
    var alu6 = ((lidx0*1152)+(ridx4*9));
    var val0 = data2[alu6];
    var alu7 = (cast0+(ridx4*2704)+alu1+alu0);
    var val1 = select(0.0f, data1[(alu7+86475)], (alu2&alu3));
    var val2 = select(0.0f, data1[(alu7+86476)], alu2);
    var val3 = select(0.0f, data1[(alu7+86477)], alu2);
    var val4 = select(0.0f, data1[(alu7+86478)], alu2);
    var val5 = select(0.0f, data1[(alu7+86479)], alu2);
    var val6 = select(0.0f, data1[(alu7+86480)], (alu2&alu5));
    var val7 = select(0.0f, data1[(alu7+86527)], alu3);
    var val8 = data1[(alu7+86528)];
    var val9 = data1[(alu7+86529)];
    var val10 = data1[(alu7+86530)];
    var val11 = data1[(alu7+86531)];
    var val12 = select(0.0f, data1[(alu7+86532)], alu5);
    var val13 = select(0.0f, data1[(alu7+86579)], (alu4&alu3));
    var val14 = select(0.0f, data1[(alu7+86580)], alu4);
    var val15 = select(0.0f, data1[(alu7+86581)], alu4);
    var val16 = select(0.0f, data1[(alu7+86582)], alu4);
    var val17 = select(0.0f, data1[(alu7+86583)], alu4);
    var val18 = select(0.0f, data1[(alu7+86584)], (alu4&alu5));
    var val19 = data2[(alu6+1)];
    var val20 = data2[(alu6+2)];
    var val21 = data2[(alu6+3)];
    var val22 = data2[(alu6+4)];
    var val23 = data2[(alu6+5)];
    var val24 = data2[(alu6+6)];
    var val25 = data2[(alu6+7)];
    var val26 = data2[(alu6+8)];
    var val27 = data2[(alu6+288)];
    var val28 = data2[(alu6+289)];
    var val29 = data2[(alu6+290)];
    var val30 = data2[(alu6+291)];
    var val31 = data2[(alu6+292)];
    var val32 = data2[(alu6+293)];
    var val33 = data2[(alu6+294)];
    var val34 = data2[(alu6+295)];
    var val35 = data2[(alu6+296)];
    var val36 = data2[(alu6+576)];
    var val37 = data2[(alu6+577)];
    var val38 = data2[(alu6+578)];
    var val39 = data2[(alu6+579)];
    var val40 = data2[(alu6+580)];
    var val41 = data2[(alu6+581)];
    var val42 = data2[(alu6+582)];
    var val43 = data2[(alu6+583)];
    var val44 = data2[(alu6+584)];
    var val45 = data2[(alu6+864)];
    var val46 = data2[(alu6+865)];
    var val47 = data2[(alu6+866)];
    var val48 = data2[(alu6+867)];
    var val49 = data2[(alu6+868)];
    var val50 = data2[(alu6+869)];
    var val51 = data2[(alu6+870)];
    var val52 = data2[(alu6+871)];
    var val53 = data2[(alu6+872)];
    acc0 = (acc0+(val1*val0)+(val7*val21)+(val13*val24)+(val2*val19)+(val8*val22)+(val14*val25)+(val3*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val1*val27)+(val7*val30)+(val13*val33)+(val2*val28)+(val8*val31)+(val14*val34)+(val3*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val1*val36)+(val7*val39)+(val13*val42)+(val2*val37)+(val8*val40)+(val14*val43)+(val3*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val1*val45)+(val7*val48)+(val13*val51)+(val2*val46)+(val8*val49)+(val14*val52)+(val3*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val2*val0)+(val8*val21)+(val14*val24)+(val3*val19)+(val9*val22)+(val15*val25)+(val4*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val2*val27)+(val8*val30)+(val14*val33)+(val3*val28)+(val9*val31)+(val15*val34)+(val4*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val2*val36)+(val8*val39)+(val14*val42)+(val3*val37)+(val9*val40)+(val15*val43)+(val4*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val2*val45)+(val8*val48)+(val14*val51)+(val3*val46)+(val9*val49)+(val15*val52)+(val4*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val3*val0)+(val9*val21)+(val15*val24)+(val4*val19)+(val10*val22)+(val16*val25)+(val5*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val3*val27)+(val9*val30)+(val15*val33)+(val4*val28)+(val10*val31)+(val16*val34)+(val5*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val3*val36)+(val9*val39)+(val15*val42)+(val4*val37)+(val10*val40)+(val16*val43)+(val5*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val3*val45)+(val9*val48)+(val15*val51)+(val4*val46)+(val10*val49)+(val16*val52)+(val5*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val4*val0)+(val10*val21)+(val16*val24)+(val5*val19)+(val11*val22)+(val17*val25)+(val6*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val4*val27)+(val10*val30)+(val16*val33)+(val5*val28)+(val11*val31)+(val17*val34)+(val6*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val4*val36)+(val10*val39)+(val16*val42)+(val5*val37)+(val11*val40)+(val17*val43)+(val6*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val4*val45)+(val10*val48)+(val16*val51)+(val5*val46)+(val11*val49)+(val17*val52)+(val6*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val54 = data5[cast1];
  var val55 = data3[cast1];
  var val56 = data4[cast1];
  var val57 = data6[cast1];
  var alu25 = (cast1+1);
  var val58 = data5[alu25];
  var val59 = data3[alu25];
  var val60 = data4[alu25];
  var val61 = data6[alu25];
  var alu26 = (cast1+2);
  var val62 = data5[alu26];
  var val63 = data3[alu26];
  var val64 = data4[alu26];
  var val65 = data6[alu26];
  var alu27 = (cast1+3);
  var val66 = data5[alu27];
  var val67 = data3[alu27];
  var val68 = data4[alu27];
  var val69 = data6[alu27];
  var alu28 = (alu0+(lidx0*10816)+cast0+alu1);
  var cast2 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu29 = (((acc0-val55)*val56*cast2)+val57);
  data0[alu28] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc1-val59)*val60*cast3)+val61);
  data0[(alu28+2704)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc2-val63)*val64*cast4)+val65);
  data0[(alu28+5408)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc3-val67)*val68*cast5)+val69);
  data0[(alu28+8112)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc4-val55)*val56*cast2)+val57);
  data0[(alu28+1)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc5-val59)*val60*cast3)+val61);
  data0[(alu28+2705)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc6-val63)*val64*cast4)+val65);
  data0[(alu28+5409)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc7-val67)*val68*cast5)+val69);
  data0[(alu28+8113)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc8-val55)*val56*cast2)+val57);
  data0[(alu28+2)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc9-val59)*val60*cast3)+val61);
  data0[(alu28+2706)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc10-val63)*val64*cast4)+val65);
  data0[(alu28+5410)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc11-val67)*val68*cast5)+val69);
  data0[(alu28+8114)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc12-val55)*val56*cast2)+val57);
  data0[(alu28+3)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
  var alu55 = (((acc13-val59)*val60*cast3)+val61);
  data0[(alu28+2707)] = (alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f)))));
  var alu57 = (((acc14-val63)*val64*cast4)+val65);
  data0[(alu28+5411)] = (alu57*(1/(1.0f+exp2((alu57*-1.4426950408889634f)))));
  var alu59 = (((acc15-val67)*val68*cast5)+val69);
  data0[(alu28+8115)] = (alu59*(1/(1.0f+exp2((alu59*-1.4426950408889634f)))));
}`;

const r_13_13_8_4_32_4_4_3_3n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f16>;
@group(0) @binding(8)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 32; ridx4++) {
    var alu6 = ((lidx0*1152)+(ridx4*9));
    var val0 = data3[alu6];
    var alu7 = (cast0+(ridx4*2704)+alu1+alu0);
    var val1 = data2[alu7];
    var val2 = select(0.0f, data2[(alu7+-53)], (alu2&alu3));
    var val3 = select(0.0f, data2[(alu7+-52)], alu2);
    var val4 = select(0.0f, data2[(alu7+-51)], alu2);
    var val5 = select(0.0f, data2[(alu7+-50)], alu2);
    var val6 = select(0.0f, data2[(alu7+-49)], alu2);
    var val7 = select(0.0f, data2[(alu7+-48)], (alu2&alu5));
    var val8 = select(0.0f, data2[(alu7+-1)], alu3);
    var val9 = data2[(alu7+1)];
    var val10 = data2[(alu7+2)];
    var val11 = data2[(alu7+3)];
    var val12 = select(0.0f, data2[(alu7+4)], alu5);
    var val13 = select(0.0f, data2[(alu7+51)], (alu4&alu3));
    var val14 = select(0.0f, data2[(alu7+52)], alu4);
    var val15 = select(0.0f, data2[(alu7+53)], alu4);
    var val16 = select(0.0f, data2[(alu7+54)], alu4);
    var val17 = select(0.0f, data2[(alu7+55)], alu4);
    var val18 = select(0.0f, data2[(alu7+56)], (alu4&alu5));
    var val19 = data3[(alu6+1)];
    var val20 = data3[(alu6+2)];
    var val21 = data3[(alu6+3)];
    var val22 = data3[(alu6+4)];
    var val23 = data3[(alu6+5)];
    var val24 = data3[(alu6+6)];
    var val25 = data3[(alu6+7)];
    var val26 = data3[(alu6+8)];
    var val27 = data3[(alu6+288)];
    var val28 = data3[(alu6+289)];
    var val29 = data3[(alu6+290)];
    var val30 = data3[(alu6+291)];
    var val31 = data3[(alu6+292)];
    var val32 = data3[(alu6+293)];
    var val33 = data3[(alu6+294)];
    var val34 = data3[(alu6+295)];
    var val35 = data3[(alu6+296)];
    var val36 = data3[(alu6+576)];
    var val37 = data3[(alu6+577)];
    var val38 = data3[(alu6+578)];
    var val39 = data3[(alu6+579)];
    var val40 = data3[(alu6+580)];
    var val41 = data3[(alu6+581)];
    var val42 = data3[(alu6+582)];
    var val43 = data3[(alu6+583)];
    var val44 = data3[(alu6+584)];
    var val45 = data3[(alu6+864)];
    var val46 = data3[(alu6+865)];
    var val47 = data3[(alu6+866)];
    var val48 = data3[(alu6+867)];
    var val49 = data3[(alu6+868)];
    var val50 = data3[(alu6+869)];
    var val51 = data3[(alu6+870)];
    var val52 = data3[(alu6+871)];
    var val53 = data3[(alu6+872)];
    acc0 = (acc0+(val2*val0)+(val8*val21)+(val13*val24)+(val3*val19)+(val1*val22)+(val14*val25)+(val4*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val2*val27)+(val8*val30)+(val13*val33)+(val3*val28)+(val1*val31)+(val14*val34)+(val4*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val2*val36)+(val8*val39)+(val13*val42)+(val3*val37)+(val1*val40)+(val14*val43)+(val4*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val2*val45)+(val8*val48)+(val13*val51)+(val3*val46)+(val1*val49)+(val14*val52)+(val4*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val3*val0)+(val1*val21)+(val14*val24)+(val4*val19)+(val9*val22)+(val15*val25)+(val5*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val3*val27)+(val1*val30)+(val14*val33)+(val4*val28)+(val9*val31)+(val15*val34)+(val5*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val3*val36)+(val1*val39)+(val14*val42)+(val4*val37)+(val9*val40)+(val15*val43)+(val5*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val3*val45)+(val1*val48)+(val14*val51)+(val4*val46)+(val9*val49)+(val15*val52)+(val5*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val4*val0)+(val9*val21)+(val15*val24)+(val5*val19)+(val10*val22)+(val16*val25)+(val6*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val4*val27)+(val9*val30)+(val15*val33)+(val5*val28)+(val10*val31)+(val16*val34)+(val6*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val4*val36)+(val9*val39)+(val15*val42)+(val5*val37)+(val10*val40)+(val16*val43)+(val6*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val4*val45)+(val9*val48)+(val15*val51)+(val5*val46)+(val10*val49)+(val16*val52)+(val6*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val5*val0)+(val10*val21)+(val16*val24)+(val6*val19)+(val11*val22)+(val17*val25)+(val7*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val5*val27)+(val10*val30)+(val16*val33)+(val6*val28)+(val11*val31)+(val17*val34)+(val7*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val5*val36)+(val10*val39)+(val16*val42)+(val6*val37)+(val11*val40)+(val17*val43)+(val7*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val5*val45)+(val10*val48)+(val16*val51)+(val6*val46)+(val11*val49)+(val17*val52)+(val7*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val54 = data6[cast1];
  var val55 = data4[cast1];
  var val56 = data5[cast1];
  var val57 = data7[cast1];
  var alu25 = (cast1+1);
  var val58 = data6[alu25];
  var val59 = data4[alu25];
  var val60 = data5[alu25];
  var val61 = data7[alu25];
  var alu26 = (cast1+2);
  var val62 = data6[alu26];
  var val63 = data4[alu26];
  var val64 = data5[alu26];
  var val65 = data7[alu26];
  var alu27 = (cast1+3);
  var val66 = data6[alu27];
  var val67 = data4[alu27];
  var val68 = data5[alu27];
  var val69 = data7[alu27];
  var alu28 = (alu0+(lidx0*10816)+cast0+alu1);
  var val70 = data1[(alu28+86528)];
  var val71 = data1[(alu28+86529)];
  var val72 = data1[(alu28+86530)];
  var val73 = data1[(alu28+86531)];
  var val74 = data1[(alu28+89232)];
  var val75 = data1[(alu28+89233)];
  var val76 = data1[(alu28+89234)];
  var val77 = data1[(alu28+89235)];
  var val78 = data1[(alu28+91936)];
  var val79 = data1[(alu28+91937)];
  var val80 = data1[(alu28+91938)];
  var val81 = data1[(alu28+91939)];
  var val82 = data1[(alu28+94640)];
  var val83 = data1[(alu28+94641)];
  var val84 = data1[(alu28+94642)];
  var val85 = data1[(alu28+94643)];
  var cast2 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu29 = (((acc0-val55)*val56*cast2)+val57);
  data0[alu28] = (val70+(alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f))))));
  var alu31 = (((acc1-val59)*val60*cast3)+val61);
  data0[(alu28+2704)] = (val74+(alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f))))));
  var alu33 = (((acc2-val63)*val64*cast4)+val65);
  data0[(alu28+5408)] = (val78+(alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f))))));
  var alu35 = (((acc3-val67)*val68*cast5)+val69);
  data0[(alu28+8112)] = (val82+(alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f))))));
  var alu37 = (((acc4-val55)*val56*cast2)+val57);
  data0[(alu28+1)] = (val71+(alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f))))));
  var alu39 = (((acc5-val59)*val60*cast3)+val61);
  data0[(alu28+2705)] = (val75+(alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f))))));
  var alu41 = (((acc6-val63)*val64*cast4)+val65);
  data0[(alu28+5409)] = (val79+(alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f))))));
  var alu43 = (((acc7-val67)*val68*cast5)+val69);
  data0[(alu28+8113)] = (val83+(alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f))))));
  var alu45 = (((acc8-val55)*val56*cast2)+val57);
  data0[(alu28+2)] = (val72+(alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f))))));
  var alu47 = (((acc9-val59)*val60*cast3)+val61);
  data0[(alu28+2706)] = (val76+(alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f))))));
  var alu49 = (((acc10-val63)*val64*cast4)+val65);
  data0[(alu28+5410)] = (val80+(alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f))))));
  var alu51 = (((acc11-val67)*val68*cast5)+val69);
  data0[(alu28+8114)] = (val84+(alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f))))));
  var alu53 = (((acc12-val55)*val56*cast2)+val57);
  data0[(alu28+3)] = (val73+(alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f))))));
  var alu55 = (((acc13-val59)*val60*cast3)+val61);
  data0[(alu28+2707)] = (val77+(alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f))))));
  var alu57 = (((acc14-val63)*val64*cast4)+val65);
  data0[(alu28+5411)] = (val81+(alu57*(1/(1.0f+exp2((alu57*-1.4426950408889634f))))));
  var alu59 = (((acc15-val67)*val68*cast5)+val69);
  data0[(alu28+8115)] = (val85+(alu59*(1/(1.0f+exp2((alu59*-1.4426950408889634f))))));
}`;

const r_13_13_8_4_32_4_4_3_3n2 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 32; ridx4++) {
    var alu6 = ((lidx0*1152)+(ridx4*9));
    var val0 = data2[alu6];
    var alu7 = (cast0+(ridx4*2704)+alu1+alu0);
    var val1 = data1[alu7];
    var val2 = select(0.0f, data1[(alu7+-53)], (alu2&alu3));
    var val3 = select(0.0f, data1[(alu7+-52)], alu2);
    var val4 = select(0.0f, data1[(alu7+-51)], alu2);
    var val5 = select(0.0f, data1[(alu7+-50)], alu2);
    var val6 = select(0.0f, data1[(alu7+-49)], alu2);
    var val7 = select(0.0f, data1[(alu7+-48)], (alu2&alu5));
    var val8 = select(0.0f, data1[(alu7+-1)], alu3);
    var val9 = data1[(alu7+1)];
    var val10 = data1[(alu7+2)];
    var val11 = data1[(alu7+3)];
    var val12 = select(0.0f, data1[(alu7+4)], alu5);
    var val13 = select(0.0f, data1[(alu7+51)], (alu4&alu3));
    var val14 = select(0.0f, data1[(alu7+52)], alu4);
    var val15 = select(0.0f, data1[(alu7+53)], alu4);
    var val16 = select(0.0f, data1[(alu7+54)], alu4);
    var val17 = select(0.0f, data1[(alu7+55)], alu4);
    var val18 = select(0.0f, data1[(alu7+56)], (alu4&alu5));
    var val19 = data2[(alu6+1)];
    var val20 = data2[(alu6+2)];
    var val21 = data2[(alu6+3)];
    var val22 = data2[(alu6+4)];
    var val23 = data2[(alu6+5)];
    var val24 = data2[(alu6+6)];
    var val25 = data2[(alu6+7)];
    var val26 = data2[(alu6+8)];
    var val27 = data2[(alu6+288)];
    var val28 = data2[(alu6+289)];
    var val29 = data2[(alu6+290)];
    var val30 = data2[(alu6+291)];
    var val31 = data2[(alu6+292)];
    var val32 = data2[(alu6+293)];
    var val33 = data2[(alu6+294)];
    var val34 = data2[(alu6+295)];
    var val35 = data2[(alu6+296)];
    var val36 = data2[(alu6+576)];
    var val37 = data2[(alu6+577)];
    var val38 = data2[(alu6+578)];
    var val39 = data2[(alu6+579)];
    var val40 = data2[(alu6+580)];
    var val41 = data2[(alu6+581)];
    var val42 = data2[(alu6+582)];
    var val43 = data2[(alu6+583)];
    var val44 = data2[(alu6+584)];
    var val45 = data2[(alu6+864)];
    var val46 = data2[(alu6+865)];
    var val47 = data2[(alu6+866)];
    var val48 = data2[(alu6+867)];
    var val49 = data2[(alu6+868)];
    var val50 = data2[(alu6+869)];
    var val51 = data2[(alu6+870)];
    var val52 = data2[(alu6+871)];
    var val53 = data2[(alu6+872)];
    acc0 = (acc0+(val2*val0)+(val8*val21)+(val13*val24)+(val3*val19)+(val1*val22)+(val14*val25)+(val4*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val2*val27)+(val8*val30)+(val13*val33)+(val3*val28)+(val1*val31)+(val14*val34)+(val4*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val2*val36)+(val8*val39)+(val13*val42)+(val3*val37)+(val1*val40)+(val14*val43)+(val4*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val2*val45)+(val8*val48)+(val13*val51)+(val3*val46)+(val1*val49)+(val14*val52)+(val4*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val3*val0)+(val1*val21)+(val14*val24)+(val4*val19)+(val9*val22)+(val15*val25)+(val5*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val3*val27)+(val1*val30)+(val14*val33)+(val4*val28)+(val9*val31)+(val15*val34)+(val5*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val3*val36)+(val1*val39)+(val14*val42)+(val4*val37)+(val9*val40)+(val15*val43)+(val5*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val3*val45)+(val1*val48)+(val14*val51)+(val4*val46)+(val9*val49)+(val15*val52)+(val5*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val4*val0)+(val9*val21)+(val15*val24)+(val5*val19)+(val10*val22)+(val16*val25)+(val6*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val4*val27)+(val9*val30)+(val15*val33)+(val5*val28)+(val10*val31)+(val16*val34)+(val6*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val4*val36)+(val9*val39)+(val15*val42)+(val5*val37)+(val10*val40)+(val16*val43)+(val6*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val4*val45)+(val9*val48)+(val15*val51)+(val5*val46)+(val10*val49)+(val16*val52)+(val6*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val5*val0)+(val10*val21)+(val16*val24)+(val6*val19)+(val11*val22)+(val17*val25)+(val7*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val5*val27)+(val10*val30)+(val16*val33)+(val6*val28)+(val11*val31)+(val17*val34)+(val7*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val5*val36)+(val10*val39)+(val16*val42)+(val6*val37)+(val11*val40)+(val17*val43)+(val7*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val5*val45)+(val10*val48)+(val16*val51)+(val6*val46)+(val11*val49)+(val17*val52)+(val7*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val54 = data5[cast1];
  var val55 = data3[cast1];
  var val56 = data4[cast1];
  var val57 = data6[cast1];
  var alu25 = (cast1+1);
  var val58 = data5[alu25];
  var val59 = data3[alu25];
  var val60 = data4[alu25];
  var val61 = data6[alu25];
  var alu26 = (cast1+2);
  var val62 = data5[alu26];
  var val63 = data3[alu26];
  var val64 = data4[alu26];
  var val65 = data6[alu26];
  var alu27 = (cast1+3);
  var val66 = data5[alu27];
  var val67 = data3[alu27];
  var val68 = data4[alu27];
  var val69 = data6[alu27];
  var alu28 = (alu0+(lidx0*10816)+cast0+alu1);
  var cast2 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu29 = (((acc0-val55)*val56*cast2)+val57);
  data0[alu28] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc1-val59)*val60*cast3)+val61);
  data0[(alu28+2704)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc2-val63)*val64*cast4)+val65);
  data0[(alu28+5408)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc3-val67)*val68*cast5)+val69);
  data0[(alu28+8112)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc4-val55)*val56*cast2)+val57);
  data0[(alu28+1)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc5-val59)*val60*cast3)+val61);
  data0[(alu28+2705)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc6-val63)*val64*cast4)+val65);
  data0[(alu28+5409)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc7-val67)*val68*cast5)+val69);
  data0[(alu28+8113)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc8-val55)*val56*cast2)+val57);
  data0[(alu28+2)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc9-val59)*val60*cast3)+val61);
  data0[(alu28+2706)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc10-val63)*val64*cast4)+val65);
  data0[(alu28+5410)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc11-val67)*val68*cast5)+val69);
  data0[(alu28+8114)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc12-val55)*val56*cast2)+val57);
  data0[(alu28+3)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
  var alu55 = (((acc13-val59)*val60*cast3)+val61);
  data0[(alu28+2707)] = (alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f)))));
  var alu57 = (((acc14-val63)*val64*cast4)+val65);
  data0[(alu28+5411)] = (alu57*(1/(1.0f+exp2((alu57*-1.4426950408889634f)))));
  var alu59 = (((acc15-val67)*val68*cast5)+val69);
  data0[(alu28+8115)] = (alu59*(1/(1.0f+exp2((alu59*-1.4426950408889634f)))));
}`;

const r_13_13_8_4_32_4_4_3_3n3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f16>;
@group(0) @binding(8)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 32; ridx4++) {
    var alu6 = ((lidx0*1152)+(ridx4*9));
    var val0 = data3[alu6];
    var alu7 = (cast0+(ridx4*2704)+alu1+alu0);
    var val1 = data2[alu7];
    var val2 = select(0.0f, data2[(alu7+-53)], (alu2&alu3));
    var val3 = select(0.0f, data2[(alu7+-52)], alu2);
    var val4 = select(0.0f, data2[(alu7+-51)], alu2);
    var val5 = select(0.0f, data2[(alu7+-50)], alu2);
    var val6 = select(0.0f, data2[(alu7+-49)], alu2);
    var val7 = select(0.0f, data2[(alu7+-48)], (alu2&alu5));
    var val8 = select(0.0f, data2[(alu7+-1)], alu3);
    var val9 = data2[(alu7+1)];
    var val10 = data2[(alu7+2)];
    var val11 = data2[(alu7+3)];
    var val12 = select(0.0f, data2[(alu7+4)], alu5);
    var val13 = select(0.0f, data2[(alu7+51)], (alu4&alu3));
    var val14 = select(0.0f, data2[(alu7+52)], alu4);
    var val15 = select(0.0f, data2[(alu7+53)], alu4);
    var val16 = select(0.0f, data2[(alu7+54)], alu4);
    var val17 = select(0.0f, data2[(alu7+55)], alu4);
    var val18 = select(0.0f, data2[(alu7+56)], (alu4&alu5));
    var val19 = data3[(alu6+1)];
    var val20 = data3[(alu6+2)];
    var val21 = data3[(alu6+3)];
    var val22 = data3[(alu6+4)];
    var val23 = data3[(alu6+5)];
    var val24 = data3[(alu6+6)];
    var val25 = data3[(alu6+7)];
    var val26 = data3[(alu6+8)];
    var val27 = data3[(alu6+288)];
    var val28 = data3[(alu6+289)];
    var val29 = data3[(alu6+290)];
    var val30 = data3[(alu6+291)];
    var val31 = data3[(alu6+292)];
    var val32 = data3[(alu6+293)];
    var val33 = data3[(alu6+294)];
    var val34 = data3[(alu6+295)];
    var val35 = data3[(alu6+296)];
    var val36 = data3[(alu6+576)];
    var val37 = data3[(alu6+577)];
    var val38 = data3[(alu6+578)];
    var val39 = data3[(alu6+579)];
    var val40 = data3[(alu6+580)];
    var val41 = data3[(alu6+581)];
    var val42 = data3[(alu6+582)];
    var val43 = data3[(alu6+583)];
    var val44 = data3[(alu6+584)];
    var val45 = data3[(alu6+864)];
    var val46 = data3[(alu6+865)];
    var val47 = data3[(alu6+866)];
    var val48 = data3[(alu6+867)];
    var val49 = data3[(alu6+868)];
    var val50 = data3[(alu6+869)];
    var val51 = data3[(alu6+870)];
    var val52 = data3[(alu6+871)];
    var val53 = data3[(alu6+872)];
    acc0 = (acc0+(val2*val0)+(val8*val21)+(val13*val24)+(val3*val19)+(val1*val22)+(val14*val25)+(val4*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val2*val27)+(val8*val30)+(val13*val33)+(val3*val28)+(val1*val31)+(val14*val34)+(val4*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val2*val36)+(val8*val39)+(val13*val42)+(val3*val37)+(val1*val40)+(val14*val43)+(val4*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val2*val45)+(val8*val48)+(val13*val51)+(val3*val46)+(val1*val49)+(val14*val52)+(val4*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val3*val0)+(val1*val21)+(val14*val24)+(val4*val19)+(val9*val22)+(val15*val25)+(val5*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val3*val27)+(val1*val30)+(val14*val33)+(val4*val28)+(val9*val31)+(val15*val34)+(val5*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val3*val36)+(val1*val39)+(val14*val42)+(val4*val37)+(val9*val40)+(val15*val43)+(val5*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val3*val45)+(val1*val48)+(val14*val51)+(val4*val46)+(val9*val49)+(val15*val52)+(val5*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val4*val0)+(val9*val21)+(val15*val24)+(val5*val19)+(val10*val22)+(val16*val25)+(val6*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val4*val27)+(val9*val30)+(val15*val33)+(val5*val28)+(val10*val31)+(val16*val34)+(val6*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val4*val36)+(val9*val39)+(val15*val42)+(val5*val37)+(val10*val40)+(val16*val43)+(val6*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val4*val45)+(val9*val48)+(val15*val51)+(val5*val46)+(val10*val49)+(val16*val52)+(val6*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val5*val0)+(val10*val21)+(val16*val24)+(val6*val19)+(val11*val22)+(val17*val25)+(val7*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val5*val27)+(val10*val30)+(val16*val33)+(val6*val28)+(val11*val31)+(val17*val34)+(val7*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val5*val36)+(val10*val39)+(val16*val42)+(val6*val37)+(val11*val40)+(val17*val43)+(val7*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val5*val45)+(val10*val48)+(val16*val51)+(val6*val46)+(val11*val49)+(val17*val52)+(val7*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val54 = data6[cast1];
  var val55 = data4[cast1];
  var val56 = data5[cast1];
  var val57 = data7[cast1];
  var alu25 = (cast1+1);
  var val58 = data6[alu25];
  var val59 = data4[alu25];
  var val60 = data5[alu25];
  var val61 = data7[alu25];
  var alu26 = (cast1+2);
  var val62 = data6[alu26];
  var val63 = data4[alu26];
  var val64 = data5[alu26];
  var val65 = data7[alu26];
  var alu27 = (cast1+3);
  var val66 = data6[alu27];
  var val67 = data4[alu27];
  var val68 = data5[alu27];
  var val69 = data7[alu27];
  var alu28 = (alu0+(lidx0*10816)+cast0+alu1);
  var val70 = data1[alu28];
  var alu29 = (alu28+1);
  var val71 = data1[alu29];
  var alu30 = (alu28+2);
  var val72 = data1[alu30];
  var alu31 = (alu28+3);
  var val73 = data1[alu31];
  var alu32 = (alu28+2704);
  var val74 = data1[alu32];
  var alu33 = (alu28+2705);
  var val75 = data1[alu33];
  var alu34 = (alu28+2706);
  var val76 = data1[alu34];
  var alu35 = (alu28+2707);
  var val77 = data1[alu35];
  var alu36 = (alu28+5408);
  var val78 = data1[alu36];
  var alu37 = (alu28+5409);
  var val79 = data1[alu37];
  var alu38 = (alu28+5410);
  var val80 = data1[alu38];
  var alu39 = (alu28+5411);
  var val81 = data1[alu39];
  var alu40 = (alu28+8112);
  var val82 = data1[alu40];
  var alu41 = (alu28+8113);
  var val83 = data1[alu41];
  var alu42 = (alu28+8114);
  var val84 = data1[alu42];
  var alu43 = (alu28+8115);
  var val85 = data1[alu43];
  var cast2 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu44 = (((acc0-val55)*val56*cast2)+val57);
  data0[alu28] = (val70+(alu44*(1/(1.0f+exp2((alu44*-1.4426950408889634f))))));
  var alu46 = (((acc1-val59)*val60*cast3)+val61);
  data0[alu32] = (val74+(alu46*(1/(1.0f+exp2((alu46*-1.4426950408889634f))))));
  var alu48 = (((acc2-val63)*val64*cast4)+val65);
  data0[alu36] = (val78+(alu48*(1/(1.0f+exp2((alu48*-1.4426950408889634f))))));
  var alu50 = (((acc3-val67)*val68*cast5)+val69);
  data0[alu40] = (val82+(alu50*(1/(1.0f+exp2((alu50*-1.4426950408889634f))))));
  var alu52 = (((acc4-val55)*val56*cast2)+val57);
  data0[alu29] = (val71+(alu52*(1/(1.0f+exp2((alu52*-1.4426950408889634f))))));
  var alu54 = (((acc5-val59)*val60*cast3)+val61);
  data0[alu33] = (val75+(alu54*(1/(1.0f+exp2((alu54*-1.4426950408889634f))))));
  var alu56 = (((acc6-val63)*val64*cast4)+val65);
  data0[alu37] = (val79+(alu56*(1/(1.0f+exp2((alu56*-1.4426950408889634f))))));
  var alu58 = (((acc7-val67)*val68*cast5)+val69);
  data0[alu41] = (val83+(alu58*(1/(1.0f+exp2((alu58*-1.4426950408889634f))))));
  var alu60 = (((acc8-val55)*val56*cast2)+val57);
  data0[alu30] = (val72+(alu60*(1/(1.0f+exp2((alu60*-1.4426950408889634f))))));
  var alu62 = (((acc9-val59)*val60*cast3)+val61);
  data0[alu34] = (val76+(alu62*(1/(1.0f+exp2((alu62*-1.4426950408889634f))))));
  var alu64 = (((acc10-val63)*val64*cast4)+val65);
  data0[alu38] = (val80+(alu64*(1/(1.0f+exp2((alu64*-1.4426950408889634f))))));
  var alu66 = (((acc11-val67)*val68*cast5)+val69);
  data0[alu42] = (val84+(alu66*(1/(1.0f+exp2((alu66*-1.4426950408889634f))))));
  var alu68 = (((acc12-val55)*val56*cast2)+val57);
  data0[alu31] = (val73+(alu68*(1/(1.0f+exp2((alu68*-1.4426950408889634f))))));
  var alu70 = (((acc13-val59)*val60*cast3)+val61);
  data0[alu35] = (val77+(alu70*(1/(1.0f+exp2((alu70*-1.4426950408889634f))))));
  var alu72 = (((acc14-val63)*val64*cast4)+val65);
  data0[alu39] = (val81+(alu72*(1/(1.0f+exp2((alu72*-1.4426950408889634f))))));
  var alu74 = (((acc15-val67)*val68*cast5)+val69);
  data0[alu43] = (val85+(alu74*(1/(1.0f+exp2((alu74*-1.4426950408889634f))))));
}`;

const E_4_169_32_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx1;
  var alu0 = (lidx0*2704);
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var cast0 = bitcast<i32>(precast2);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var cast1 = bitcast<i32>(precast3);
  var alu1 = (cast1+cast0+alu0);
  var alu2 = (alu1+1);
  var alu3 = (alu1+2);
  var alu4 = (alu1+3);
  var alu5 = (gidx1<1);
  var val0 = select(0.0f, data1[alu1], alu5);
  var val1 = select(0.0f, data1[alu2], alu5);
  var val2 = select(0.0f, data1[alu3], alu5);
  var val3 = select(0.0f, data1[alu4], alu5);
  var alu6 = (gidx1<2);
  var alu7 = (gidx1<3);
  var alu8 = (alu7!=true);
  var val4 = select(0.0f, data3[alu1], alu8);
  var val5 = select(0.0f, data3[alu2], alu8);
  var val6 = select(0.0f, data3[alu3], alu8);
  var val7 = select(0.0f, data3[alu4], alu8);
  var alu9 = ((alu5!=true)&alu6);
  var val8 = select(0.0f, data1[(alu1+86528)], alu9);
  var val9 = select(0.0f, data1[(alu1+86529)], alu9);
  var val10 = select(0.0f, data1[(alu1+86530)], alu9);
  var val11 = select(0.0f, data1[(alu1+86531)], alu9);
  var alu10 = ((alu6!=true)&alu7);
  var val12 = select(0.0f, data2[alu1], alu10);
  var val13 = select(0.0f, data2[alu2], alu10);
  var val14 = select(0.0f, data2[alu3], alu10);
  var val15 = select(0.0f, data2[alu4], alu10);
  var alu11 = (cast1+alu0+cast0+(gidx1*86528));
  data0[alu11] = (val0+val8+val12+val4);
  data0[(alu11+1)] = (val1+val9+val13+val5);
  data0[(alu11+2)] = (val2+val10+val14+val6);
  data0[(alu11+3)] = (val3+val11+val15+val7);
}`;

const r_169_16_4_32_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  var cast1 = bitcast<i32>(precast3);
  var precast4 = lidx0;
  var cast2 = bitcast<u32>(precast4);
  var precast5 = (cast2<<9u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 32; ridx3++) {
    var precast6 = ridx3;
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu0 = (bitcast<i32>(precast5)+bitcast<i32>(precast7));
    var val0 = data2[alu0];
    var alu1 = ((ridx3*10816)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+128)];
    var val6 = data2[(alu0+129)];
    var val7 = data2[(alu0+130)];
    var val8 = data2[(alu0+131)];
    var val9 = data2[(alu0+256)];
    var val10 = data2[(alu0+257)];
    var val11 = data2[(alu0+258)];
    var val12 = data2[(alu0+259)];
    var val13 = data2[(alu0+384)];
    var val14 = data2[(alu0+385)];
    var val15 = data2[(alu0+386)];
    var val16 = data2[(alu0+387)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+2704)];
    var val21 = data1[(alu1+2705)];
    var val22 = data1[(alu1+2706)];
    var val23 = data1[(alu1+2707)];
    var val24 = data1[(alu1+5408)];
    var val25 = data1[(alu1+5409)];
    var val26 = data1[(alu1+5410)];
    var val27 = data1[(alu1+5411)];
    var val28 = data1[(alu1+8112)];
    var val29 = data1[(alu1+8113)];
    var val30 = data1[(alu1+8114)];
    var val31 = data1[(alu1+8115)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast8 = (cast2<<2u);
  var cast3 = bitcast<i32>(precast8);
  var val32 = data5[cast3];
  var val33 = data3[cast3];
  var val34 = data4[cast3];
  var val35 = data6[cast3];
  var alu19 = (cast3+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast3+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast3+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+cast1+(lidx0*10816));
  var cast4 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast7 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast4)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast5)+val39);
  data0[(alu22+2704)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast6)+val43);
  data0[(alu22+5408)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast7)+val47);
  data0[(alu22+8112)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast4)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast5)+val39);
  data0[(alu22+2705)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast6)+val43);
  data0[(alu22+5409)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast7)+val47);
  data0[(alu22+8113)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast4)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast5)+val39);
  data0[(alu22+2706)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast6)+val43);
  data0[(alu22+5410)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast7)+val47);
  data0[(alu22+8114)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast4)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast5)+val39);
  data0[(alu22+2707)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast6)+val43);
  data0[(alu22+5411)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast7)+val47);
  data0[(alu22+8115)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const r_13_13_32_2_2_64_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx0;
  var cast0 = bitcast<u32>(precast0);
  var alu0 = (((gidx1+lidx1)<1)!=true);
  var alu1 = (((gidx0+lidx2)<1)!=true);
  var precast1 = lidx2;
  var precast2 = (cast0<<2u);
  var precast3 = (bitcast<u32>(precast1)<<1u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu2 = ((lidx0*2304)+(ridx5*9));
    var val0 = data2[alu2];
    var alu3 = (bitcast<i32>(precast2)+bitcast<i32>(precast3)+(ridx5*2704)+(gidx1*208)+(lidx1*104));
    var val1 = data1[alu3];
    var val2 = data2[(alu2+1)];
    var val3 = data2[(alu2+2)];
    var val4 = data2[(alu2+3)];
    var val5 = data2[(alu2+4)];
    var val6 = data2[(alu2+5)];
    var val7 = data2[(alu2+6)];
    var val8 = data2[(alu2+7)];
    var val9 = data2[(alu2+8)];
    var val10 = data2[(alu2+576)];
    var val11 = data2[(alu2+577)];
    var val12 = data2[(alu2+578)];
    var val13 = data2[(alu2+579)];
    var val14 = data2[(alu2+580)];
    var val15 = data2[(alu2+581)];
    var val16 = data2[(alu2+582)];
    var val17 = data2[(alu2+583)];
    var val18 = data2[(alu2+584)];
    var val19 = data2[(alu2+1152)];
    var val20 = data2[(alu2+1153)];
    var val21 = data2[(alu2+1154)];
    var val22 = data2[(alu2+1155)];
    var val23 = data2[(alu2+1156)];
    var val24 = data2[(alu2+1157)];
    var val25 = data2[(alu2+1158)];
    var val26 = data2[(alu2+1159)];
    var val27 = data2[(alu2+1160)];
    var val28 = data2[(alu2+1728)];
    var val29 = data2[(alu2+1729)];
    var val30 = data2[(alu2+1730)];
    var val31 = data2[(alu2+1731)];
    var val32 = data2[(alu2+1732)];
    var val33 = data2[(alu2+1733)];
    var val34 = data2[(alu2+1734)];
    var val35 = data2[(alu2+1735)];
    var val36 = data2[(alu2+1736)];
    var val37 = select(0.0f, data1[(alu3+-53)], (alu0&alu1));
    var val38 = select(0.0f, data1[(alu3+-52)], alu0);
    var val39 = select(0.0f, data1[(alu3+-51)], alu0);
    var val40 = select(0.0f, data1[(alu3+-1)], alu1);
    var val41 = data1[(alu3+1)];
    var val42 = select(0.0f, data1[(alu3+51)], alu1);
    var val43 = data1[(alu3+52)];
    var val44 = data1[(alu3+53)];
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data5[cast1];
  var val46 = data3[cast1];
  var val47 = data4[cast1];
  var val48 = data6[cast1];
  var alu9 = (cast1+1);
  var val49 = data5[alu9];
  var val50 = data3[alu9];
  var val51 = data4[alu9];
  var val52 = data6[alu9];
  var alu10 = (cast1+2);
  var val53 = data5[alu10];
  var val54 = data3[alu10];
  var val55 = data4[alu10];
  var val56 = data6[alu10];
  var alu11 = (cast1+3);
  var val57 = data5[alu11];
  var val58 = data3[alu11];
  var val59 = data4[alu11];
  var val60 = data6[alu11];
  var precast6 = (cast0<<1u);
  var alu12 = (lidx2+(lidx1*26)+(lidx0*2704)+bitcast<i32>(precast6)+(gidx1*52));
  var alu13 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu12] = (alu13*(1/(1.0f+exp2((alu13*-1.4426950408889634f)))));
  var alu15 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu12+676)] = (alu15*(1/(1.0f+exp2((alu15*-1.4426950408889634f)))));
  var alu17 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu12+1352)] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
  var alu19 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu12+2028)] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
}`;

const r_169_32_32_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = lidx0;
  var cast1 = bitcast<u32>(precast2);
  var precast3 = (cast1<<9u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx2 = 0; ridx2 < 32; ridx2++) {
    var precast4 = ridx2;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = (cast0+(ridx2*2704));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast3)+bitcast<i32>(precast5));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+1)];
    var val3 = data1[(alu0+2)];
    var val4 = data1[(alu0+3)];
    var val5 = data1[(alu0+676)];
    var val6 = data1[(alu0+677)];
    var val7 = data1[(alu0+678)];
    var val8 = data1[(alu0+679)];
    var val9 = data1[(alu0+1352)];
    var val10 = data1[(alu0+1353)];
    var val11 = data1[(alu0+1354)];
    var val12 = data1[(alu0+1355)];
    var val13 = data1[(alu0+2028)];
    var val14 = data1[(alu0+2029)];
    var val15 = data1[(alu0+2030)];
    var val16 = data1[(alu0+2031)];
    var val17 = data2[(alu1+1)];
    var val18 = data2[(alu1+2)];
    var val19 = data2[(alu1+3)];
    var val20 = data2[(alu1+128)];
    var val21 = data2[(alu1+129)];
    var val22 = data2[(alu1+130)];
    var val23 = data2[(alu1+131)];
    var val24 = data2[(alu1+256)];
    var val25 = data2[(alu1+257)];
    var val26 = data2[(alu1+258)];
    var val27 = data2[(alu1+259)];
    var val28 = data2[(alu1+384)];
    var val29 = data2[(alu1+385)];
    var val30 = data2[(alu1+386)];
    var val31 = data2[(alu1+387)];
    acc0 = (acc0+(val0*val1)+(val5*val17)+(val9*val18)+(val13*val19));
    acc1 = (acc1+(val0*val20)+(val5*val21)+(val9*val22)+(val13*val23));
    acc2 = (acc2+(val0*val24)+(val5*val25)+(val9*val26)+(val13*val27));
    acc3 = (acc3+(val0*val28)+(val5*val29)+(val9*val30)+(val13*val31));
    acc4 = (acc4+(val2*val1)+(val6*val17)+(val10*val18)+(val14*val19));
    acc5 = (acc5+(val2*val20)+(val6*val21)+(val10*val22)+(val14*val23));
    acc6 = (acc6+(val2*val24)+(val6*val25)+(val10*val26)+(val14*val27));
    acc7 = (acc7+(val2*val28)+(val6*val29)+(val10*val30)+(val14*val31));
    acc8 = (acc8+(val3*val1)+(val7*val17)+(val11*val18)+(val15*val19));
    acc9 = (acc9+(val3*val20)+(val7*val21)+(val11*val22)+(val15*val23));
    acc10 = (acc10+(val3*val24)+(val7*val25)+(val11*val26)+(val15*val27));
    acc11 = (acc11+(val3*val28)+(val7*val29)+(val11*val30)+(val15*val31));
    acc12 = (acc12+(val4*val1)+(val8*val17)+(val12*val18)+(val16*val19));
    acc13 = (acc13+(val4*val20)+(val8*val21)+(val12*val22)+(val16*val23));
    acc14 = (acc14+(val4*val24)+(val8*val25)+(val12*val26)+(val16*val27));
    acc15 = (acc15+(val4*val28)+(val8*val29)+(val12*val30)+(val16*val31));
  }
  var precast6 = (cast1<<2u);
  var cast2 = bitcast<i32>(precast6);
  var val32 = data5[cast2];
  var val33 = data3[cast2];
  var val34 = data4[cast2];
  var val35 = data6[cast2];
  var alu19 = (cast2+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast2+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast2+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+(lidx0*2704));
  var cast3 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast3)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast4)+val39);
  data0[(alu22+676)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast5)+val43);
  data0[(alu22+1352)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast6)+val47);
  data0[(alu22+2028)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast3)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast4)+val39);
  data0[(alu22+677)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast5)+val43);
  data0[(alu22+1353)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast6)+val47);
  data0[(alu22+2029)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast3)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast4)+val39);
  data0[(alu22+678)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast5)+val43);
  data0[(alu22+1354)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast6)+val47);
  data0[(alu22+2030)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast3)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast4)+val39);
  data0[(alu22+679)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast5)+val43);
  data0[(alu22+1355)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast6)+val47);
  data0[(alu22+2031)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const r_13_13_16_2_2_64_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu7 = ((lidx0*2304)+(ridx5*9));
    var val0 = data2[alu7];
    var alu8 = (alu2+(ridx5*676)+alu1+alu0);
    var val1 = data2[(alu7+1)];
    var val2 = data2[(alu7+2)];
    var val3 = data2[(alu7+3)];
    var val4 = data2[(alu7+4)];
    var val5 = data2[(alu7+5)];
    var val6 = data2[(alu7+6)];
    var val7 = data2[(alu7+7)];
    var val8 = data2[(alu7+8)];
    var val9 = data2[(alu7+576)];
    var val10 = data2[(alu7+577)];
    var val11 = data2[(alu7+578)];
    var val12 = data2[(alu7+579)];
    var val13 = data2[(alu7+580)];
    var val14 = data2[(alu7+581)];
    var val15 = data2[(alu7+582)];
    var val16 = data2[(alu7+583)];
    var val17 = data2[(alu7+584)];
    var val18 = data2[(alu7+1152)];
    var val19 = data2[(alu7+1153)];
    var val20 = data2[(alu7+1154)];
    var val21 = data2[(alu7+1155)];
    var val22 = data2[(alu7+1156)];
    var val23 = data2[(alu7+1157)];
    var val24 = data2[(alu7+1158)];
    var val25 = data2[(alu7+1159)];
    var val26 = data2[(alu7+1160)];
    var val27 = data2[(alu7+1728)];
    var val28 = data2[(alu7+1729)];
    var val29 = data2[(alu7+1730)];
    var val30 = data2[(alu7+1731)];
    var val31 = data2[(alu7+1732)];
    var val32 = data2[(alu7+1733)];
    var val33 = data2[(alu7+1734)];
    var val34 = data2[(alu7+1735)];
    var val35 = data2[(alu7+1736)];
    var val36 = select(0.0f, data1[(alu8+43237)], (alu3&alu4));
    var val37 = select(0.0f, data1[(alu8+43238)], alu3);
    var val38 = select(0.0f, data1[(alu8+43239)], (alu3&alu6));
    var val39 = select(0.0f, data1[(alu8+43263)], alu4);
    var val40 = data1[(alu8+43264)];
    var val41 = select(0.0f, data1[(alu8+43265)], alu6);
    var val42 = select(0.0f, data1[(alu8+43289)], (alu5&alu4));
    var val43 = select(0.0f, data1[(alu8+43290)], alu5);
    var val44 = select(0.0f, data1[(alu8+43291)], (alu5&alu6));
    acc0 = (acc0+(val36*val0)+(val39*val3)+(val42*val6)+(val37*val1)+(val40*val4)+(val43*val7)+(val38*val2)+(val41*val5)+(val44*val8));
    acc1 = (acc1+(val36*val9)+(val39*val12)+(val42*val15)+(val37*val10)+(val40*val13)+(val43*val16)+(val38*val11)+(val41*val14)+(val44*val17));
    acc2 = (acc2+(val36*val18)+(val39*val21)+(val42*val24)+(val37*val19)+(val40*val22)+(val43*val25)+(val38*val20)+(val41*val23)+(val44*val26));
    acc3 = (acc3+(val36*val27)+(val39*val30)+(val42*val33)+(val37*val28)+(val40*val31)+(val43*val34)+(val38*val29)+(val41*val32)+(val44*val35));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data5[cast1];
  var val46 = data3[cast1];
  var val47 = data4[cast1];
  var val48 = data6[cast1];
  var alu14 = (cast1+1);
  var val49 = data5[alu14];
  var val50 = data3[alu14];
  var val51 = data4[alu14];
  var val52 = data6[alu14];
  var alu15 = (cast1+2);
  var val53 = data5[alu15];
  var val54 = data3[alu15];
  var val55 = data4[alu15];
  var val56 = data6[alu15];
  var alu16 = (cast1+3);
  var val57 = data5[alu16];
  var val58 = data3[alu16];
  var val59 = data4[alu16];
  var val60 = data6[alu16];
  var alu17 = (lidx2+alu0+(lidx0*2704)+cast0+alu1);
  var alu18 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu17] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu17+676)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu17+1352)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
  var alu24 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu17+2028)] = (alu24*(1/(1.0f+exp2((alu24*-1.4426950408889634f)))));
}`;

const r_13_13_16_2_2_64_4_3_3n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f16>;
@group(0) @binding(8)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(16,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu7 = ((lidx0*2304)+(ridx5*9));
    var val0 = data3[alu7];
    var alu8 = (alu2+(ridx5*676)+alu1+alu0);
    var val1 = data2[alu8];
    var val2 = data3[(alu7+1)];
    var val3 = data3[(alu7+2)];
    var val4 = data3[(alu7+3)];
    var val5 = data3[(alu7+4)];
    var val6 = data3[(alu7+5)];
    var val7 = data3[(alu7+6)];
    var val8 = data3[(alu7+7)];
    var val9 = data3[(alu7+8)];
    var val10 = data3[(alu7+576)];
    var val11 = data3[(alu7+577)];
    var val12 = data3[(alu7+578)];
    var val13 = data3[(alu7+579)];
    var val14 = data3[(alu7+580)];
    var val15 = data3[(alu7+581)];
    var val16 = data3[(alu7+582)];
    var val17 = data3[(alu7+583)];
    var val18 = data3[(alu7+584)];
    var val19 = data3[(alu7+1152)];
    var val20 = data3[(alu7+1153)];
    var val21 = data3[(alu7+1154)];
    var val22 = data3[(alu7+1155)];
    var val23 = data3[(alu7+1156)];
    var val24 = data3[(alu7+1157)];
    var val25 = data3[(alu7+1158)];
    var val26 = data3[(alu7+1159)];
    var val27 = data3[(alu7+1160)];
    var val28 = data3[(alu7+1728)];
    var val29 = data3[(alu7+1729)];
    var val30 = data3[(alu7+1730)];
    var val31 = data3[(alu7+1731)];
    var val32 = data3[(alu7+1732)];
    var val33 = data3[(alu7+1733)];
    var val34 = data3[(alu7+1734)];
    var val35 = data3[(alu7+1735)];
    var val36 = data3[(alu7+1736)];
    var val37 = select(0.0f, data2[(alu8+-27)], (alu3&alu4));
    var val38 = select(0.0f, data2[(alu8+-26)], alu3);
    var val39 = select(0.0f, data2[(alu8+-25)], (alu3&alu6));
    var val40 = select(0.0f, data2[(alu8+-1)], alu4);
    var val41 = select(0.0f, data2[(alu8+1)], alu6);
    var val42 = select(0.0f, data2[(alu8+25)], (alu5&alu4));
    var val43 = select(0.0f, data2[(alu8+26)], alu5);
    var val44 = select(0.0f, data2[(alu8+27)], (alu5&alu6));
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data6[cast1];
  var val46 = data4[cast1];
  var val47 = data5[cast1];
  var val48 = data7[cast1];
  var alu14 = (cast1+1);
  var val49 = data6[alu14];
  var val50 = data4[alu14];
  var val51 = data5[alu14];
  var val52 = data7[alu14];
  var alu15 = (cast1+2);
  var val53 = data6[alu15];
  var val54 = data4[alu15];
  var val55 = data5[alu15];
  var val56 = data7[alu15];
  var alu16 = (cast1+3);
  var val57 = data6[alu16];
  var val58 = data4[alu16];
  var val59 = data5[alu16];
  var val60 = data7[alu16];
  var alu17 = (lidx2+alu0+(lidx0*2704)+cast0+alu1);
  var val61 = data1[(alu17+43264)];
  var val62 = data1[(alu17+43940)];
  var val63 = data1[(alu17+44616)];
  var val64 = data1[(alu17+45292)];
  var alu18 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu17] = (val61+(alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f))))));
  var alu20 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu17+676)] = (val62+(alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f))))));
  var alu22 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu17+1352)] = (val63+(alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f))))));
  var alu24 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu17+2028)] = (val64+(alu24*(1/(1.0f+exp2((alu24*-1.4426950408889634f))))));
}`;

const r_13_13_16_2_2_64_4_3_3n2 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu7 = ((lidx0*2304)+(ridx5*9));
    var val0 = data2[alu7];
    var alu8 = (alu2+(ridx5*676)+alu1+alu0);
    var val1 = data1[alu8];
    var val2 = data2[(alu7+1)];
    var val3 = data2[(alu7+2)];
    var val4 = data2[(alu7+3)];
    var val5 = data2[(alu7+4)];
    var val6 = data2[(alu7+5)];
    var val7 = data2[(alu7+6)];
    var val8 = data2[(alu7+7)];
    var val9 = data2[(alu7+8)];
    var val10 = data2[(alu7+576)];
    var val11 = data2[(alu7+577)];
    var val12 = data2[(alu7+578)];
    var val13 = data2[(alu7+579)];
    var val14 = data2[(alu7+580)];
    var val15 = data2[(alu7+581)];
    var val16 = data2[(alu7+582)];
    var val17 = data2[(alu7+583)];
    var val18 = data2[(alu7+584)];
    var val19 = data2[(alu7+1152)];
    var val20 = data2[(alu7+1153)];
    var val21 = data2[(alu7+1154)];
    var val22 = data2[(alu7+1155)];
    var val23 = data2[(alu7+1156)];
    var val24 = data2[(alu7+1157)];
    var val25 = data2[(alu7+1158)];
    var val26 = data2[(alu7+1159)];
    var val27 = data2[(alu7+1160)];
    var val28 = data2[(alu7+1728)];
    var val29 = data2[(alu7+1729)];
    var val30 = data2[(alu7+1730)];
    var val31 = data2[(alu7+1731)];
    var val32 = data2[(alu7+1732)];
    var val33 = data2[(alu7+1733)];
    var val34 = data2[(alu7+1734)];
    var val35 = data2[(alu7+1735)];
    var val36 = data2[(alu7+1736)];
    var val37 = select(0.0f, data1[(alu8+-27)], (alu3&alu4));
    var val38 = select(0.0f, data1[(alu8+-26)], alu3);
    var val39 = select(0.0f, data1[(alu8+-25)], (alu3&alu6));
    var val40 = select(0.0f, data1[(alu8+-1)], alu4);
    var val41 = select(0.0f, data1[(alu8+1)], alu6);
    var val42 = select(0.0f, data1[(alu8+25)], (alu5&alu4));
    var val43 = select(0.0f, data1[(alu8+26)], alu5);
    var val44 = select(0.0f, data1[(alu8+27)], (alu5&alu6));
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data5[cast1];
  var val46 = data3[cast1];
  var val47 = data4[cast1];
  var val48 = data6[cast1];
  var alu14 = (cast1+1);
  var val49 = data5[alu14];
  var val50 = data3[alu14];
  var val51 = data4[alu14];
  var val52 = data6[alu14];
  var alu15 = (cast1+2);
  var val53 = data5[alu15];
  var val54 = data3[alu15];
  var val55 = data4[alu15];
  var val56 = data6[alu15];
  var alu16 = (cast1+3);
  var val57 = data5[alu16];
  var val58 = data3[alu16];
  var val59 = data4[alu16];
  var val60 = data6[alu16];
  var alu17 = (lidx2+alu0+(lidx0*2704)+cast0+alu1);
  var alu18 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu17] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu17+676)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu17+1352)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
  var alu24 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu17+2028)] = (alu24*(1/(1.0f+exp2((alu24*-1.4426950408889634f)))));
}`;

const r_13_13_16_2_2_64_4_3_3n3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f16>;
@group(0) @binding(8)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(16,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu7 = ((lidx0*2304)+(ridx5*9));
    var val0 = data3[alu7];
    var alu8 = (alu2+(ridx5*676)+alu1+alu0);
    var val1 = data2[alu8];
    var val2 = data3[(alu7+1)];
    var val3 = data3[(alu7+2)];
    var val4 = data3[(alu7+3)];
    var val5 = data3[(alu7+4)];
    var val6 = data3[(alu7+5)];
    var val7 = data3[(alu7+6)];
    var val8 = data3[(alu7+7)];
    var val9 = data3[(alu7+8)];
    var val10 = data3[(alu7+576)];
    var val11 = data3[(alu7+577)];
    var val12 = data3[(alu7+578)];
    var val13 = data3[(alu7+579)];
    var val14 = data3[(alu7+580)];
    var val15 = data3[(alu7+581)];
    var val16 = data3[(alu7+582)];
    var val17 = data3[(alu7+583)];
    var val18 = data3[(alu7+584)];
    var val19 = data3[(alu7+1152)];
    var val20 = data3[(alu7+1153)];
    var val21 = data3[(alu7+1154)];
    var val22 = data3[(alu7+1155)];
    var val23 = data3[(alu7+1156)];
    var val24 = data3[(alu7+1157)];
    var val25 = data3[(alu7+1158)];
    var val26 = data3[(alu7+1159)];
    var val27 = data3[(alu7+1160)];
    var val28 = data3[(alu7+1728)];
    var val29 = data3[(alu7+1729)];
    var val30 = data3[(alu7+1730)];
    var val31 = data3[(alu7+1731)];
    var val32 = data3[(alu7+1732)];
    var val33 = data3[(alu7+1733)];
    var val34 = data3[(alu7+1734)];
    var val35 = data3[(alu7+1735)];
    var val36 = data3[(alu7+1736)];
    var val37 = select(0.0f, data2[(alu8+-27)], (alu3&alu4));
    var val38 = select(0.0f, data2[(alu8+-26)], alu3);
    var val39 = select(0.0f, data2[(alu8+-25)], (alu3&alu6));
    var val40 = select(0.0f, data2[(alu8+-1)], alu4);
    var val41 = select(0.0f, data2[(alu8+1)], alu6);
    var val42 = select(0.0f, data2[(alu8+25)], (alu5&alu4));
    var val43 = select(0.0f, data2[(alu8+26)], alu5);
    var val44 = select(0.0f, data2[(alu8+27)], (alu5&alu6));
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data6[cast1];
  var val46 = data4[cast1];
  var val47 = data5[cast1];
  var val48 = data7[cast1];
  var alu14 = (cast1+1);
  var val49 = data6[alu14];
  var val50 = data4[alu14];
  var val51 = data5[alu14];
  var val52 = data7[alu14];
  var alu15 = (cast1+2);
  var val53 = data6[alu15];
  var val54 = data4[alu15];
  var val55 = data5[alu15];
  var val56 = data7[alu15];
  var alu16 = (cast1+3);
  var val57 = data6[alu16];
  var val58 = data4[alu16];
  var val59 = data5[alu16];
  var val60 = data7[alu16];
  var alu17 = (lidx2+alu0+(lidx0*2704)+cast0+alu1);
  var val61 = data1[alu17];
  var alu18 = (alu17+676);
  var val62 = data1[alu18];
  var alu19 = (alu17+1352);
  var val63 = data1[alu19];
  var alu20 = (alu17+2028);
  var val64 = data1[alu20];
  var alu21 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu17] = (val61+(alu21*(1/(1.0f+exp2((alu21*-1.4426950408889634f))))));
  var alu23 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[alu18] = (val62+(alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f))))));
  var alu25 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[alu19] = (val63+(alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f))))));
  var alu27 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[alu20] = (val64+(alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f))))));
}`;

const E_8_169_32_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var alu0 = ((lidx0*676)+bitcast<i32>(precast1)+(gidx1*21632));
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var alu3 = (alu0+3);
  var alu4 = (gidx1<2);
  var val0 = select(0.0f, data1[alu0], alu4);
  var val1 = select(0.0f, data1[alu1], alu4);
  var val2 = select(0.0f, data1[alu2], alu4);
  var val3 = select(0.0f, data1[alu3], alu4);
  var alu5 = (gidx1<4);
  var alu6 = (gidx1<6);
  var alu7 = (alu6!=true);
  var val4 = select(0.0f, data3[(alu0+-129792)], alu7);
  var val5 = select(0.0f, data3[(alu0+-129791)], alu7);
  var val6 = select(0.0f, data3[(alu0+-129790)], alu7);
  var val7 = select(0.0f, data3[(alu0+-129789)], alu7);
  var alu8 = ((alu4!=true)&alu5);
  var val8 = select(0.0f, data1[alu0], alu8);
  var val9 = select(0.0f, data1[alu1], alu8);
  var val10 = select(0.0f, data1[alu2], alu8);
  var val11 = select(0.0f, data1[alu3], alu8);
  var alu9 = ((alu5!=true)&alu6);
  var val12 = select(0.0f, data2[(alu0+-86528)], alu9);
  var val13 = select(0.0f, data2[(alu0+-86527)], alu9);
  var val14 = select(0.0f, data2[(alu0+-86526)], alu9);
  var val15 = select(0.0f, data2[(alu0+-86525)], alu9);
  data0[alu0] = (val0+val8+val12+val4);
  data0[alu1] = (val1+val9+val13+val5);
  data0[alu2] = (val2+val10+val14+val6);
  data0[alu3] = (val3+val11+val15+val7);
}`;

const r_169_32_64_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = lidx0;
  var cast1 = bitcast<u32>(precast2);
  var precast3 = (cast1<<10u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx2 = 0; ridx2 < 64; ridx2++) {
    var precast4 = ridx2;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = (cast0+(ridx2*2704));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast3)+bitcast<i32>(precast5));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+1)];
    var val3 = data1[(alu0+2)];
    var val4 = data1[(alu0+3)];
    var val5 = data1[(alu0+676)];
    var val6 = data1[(alu0+677)];
    var val7 = data1[(alu0+678)];
    var val8 = data1[(alu0+679)];
    var val9 = data1[(alu0+1352)];
    var val10 = data1[(alu0+1353)];
    var val11 = data1[(alu0+1354)];
    var val12 = data1[(alu0+1355)];
    var val13 = data1[(alu0+2028)];
    var val14 = data1[(alu0+2029)];
    var val15 = data1[(alu0+2030)];
    var val16 = data1[(alu0+2031)];
    var val17 = data2[(alu1+1)];
    var val18 = data2[(alu1+2)];
    var val19 = data2[(alu1+3)];
    var val20 = data2[(alu1+256)];
    var val21 = data2[(alu1+257)];
    var val22 = data2[(alu1+258)];
    var val23 = data2[(alu1+259)];
    var val24 = data2[(alu1+512)];
    var val25 = data2[(alu1+513)];
    var val26 = data2[(alu1+514)];
    var val27 = data2[(alu1+515)];
    var val28 = data2[(alu1+768)];
    var val29 = data2[(alu1+769)];
    var val30 = data2[(alu1+770)];
    var val31 = data2[(alu1+771)];
    acc0 = (acc0+(val0*val1)+(val5*val17)+(val9*val18)+(val13*val19));
    acc1 = (acc1+(val0*val20)+(val5*val21)+(val9*val22)+(val13*val23));
    acc2 = (acc2+(val0*val24)+(val5*val25)+(val9*val26)+(val13*val27));
    acc3 = (acc3+(val0*val28)+(val5*val29)+(val9*val30)+(val13*val31));
    acc4 = (acc4+(val2*val1)+(val6*val17)+(val10*val18)+(val14*val19));
    acc5 = (acc5+(val2*val20)+(val6*val21)+(val10*val22)+(val14*val23));
    acc6 = (acc6+(val2*val24)+(val6*val25)+(val10*val26)+(val14*val27));
    acc7 = (acc7+(val2*val28)+(val6*val29)+(val10*val30)+(val14*val31));
    acc8 = (acc8+(val3*val1)+(val7*val17)+(val11*val18)+(val15*val19));
    acc9 = (acc9+(val3*val20)+(val7*val21)+(val11*val22)+(val15*val23));
    acc10 = (acc10+(val3*val24)+(val7*val25)+(val11*val26)+(val15*val27));
    acc11 = (acc11+(val3*val28)+(val7*val29)+(val11*val30)+(val15*val31));
    acc12 = (acc12+(val4*val1)+(val8*val17)+(val12*val18)+(val16*val19));
    acc13 = (acc13+(val4*val20)+(val8*val21)+(val12*val22)+(val16*val23));
    acc14 = (acc14+(val4*val24)+(val8*val25)+(val12*val26)+(val16*val27));
    acc15 = (acc15+(val4*val28)+(val8*val29)+(val12*val30)+(val16*val31));
  }
  var precast6 = (cast1<<2u);
  var cast2 = bitcast<i32>(precast6);
  var val32 = data5[cast2];
  var val33 = data3[cast2];
  var val34 = data4[cast2];
  var val35 = data6[cast2];
  var alu19 = (cast2+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast2+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast2+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+(lidx0*2704));
  var cast3 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast3)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast4)+val39);
  data0[(alu22+676)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast5)+val43);
  data0[(alu22+1352)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast6)+val47);
  data0[(alu22+2028)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast3)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast4)+val39);
  data0[(alu22+677)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast5)+val43);
  data0[(alu22+1353)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast6)+val47);
  data0[(alu22+2029)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast3)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast4)+val39);
  data0[(alu22+678)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast5)+val43);
  data0[(alu22+1354)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast6)+val47);
  data0[(alu22+2030)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast3)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast4)+val39);
  data0[(alu22+679)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast5)+val43);
  data0[(alu22+1355)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast6)+val47);
  data0[(alu22+2031)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const r_2_13_13_32_128_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx1<1)!=true);
  var alu1 = ((gidx0<1)!=true);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx4 = 0; ridx4 < 128; ridx4++) {
    var alu2 = (bitcast<i32>(precast1)+(gidx1*52)+(ridx4*676));
    var val0 = data1[alu2];
    var alu3 = ((ridx4*9)+(gidx2*147456)+(lidx0*4608));
    var val1 = data2[alu3];
    var val2 = select(0.0f, data1[(alu2+-27)], (alu0&alu1));
    var val3 = select(0.0f, data1[(alu2+-26)], alu0);
    var val4 = select(0.0f, data1[(alu2+-25)], alu0);
    var val5 = select(0.0f, data1[(alu2+-1)], alu1);
    var val6 = data1[(alu2+1)];
    var val7 = select(0.0f, data1[(alu2+25)], alu1);
    var val8 = data1[(alu2+26)];
    var val9 = data1[(alu2+27)];
    var val10 = data2[(alu3+1)];
    var val11 = data2[(alu3+2)];
    var val12 = data2[(alu3+3)];
    var val13 = data2[(alu3+4)];
    var val14 = data2[(alu3+5)];
    var val15 = data2[(alu3+6)];
    var val16 = data2[(alu3+7)];
    var val17 = data2[(alu3+8)];
    var val18 = data2[(alu3+1152)];
    var val19 = data2[(alu3+1153)];
    var val20 = data2[(alu3+1154)];
    var val21 = data2[(alu3+1155)];
    var val22 = data2[(alu3+1156)];
    var val23 = data2[(alu3+1157)];
    var val24 = data2[(alu3+1158)];
    var val25 = data2[(alu3+1159)];
    var val26 = data2[(alu3+1160)];
    var val27 = data2[(alu3+2304)];
    var val28 = data2[(alu3+2305)];
    var val29 = data2[(alu3+2306)];
    var val30 = data2[(alu3+2307)];
    var val31 = data2[(alu3+2308)];
    var val32 = data2[(alu3+2309)];
    var val33 = data2[(alu3+2310)];
    var val34 = data2[(alu3+2311)];
    var val35 = data2[(alu3+2312)];
    var val36 = data2[(alu3+3456)];
    var val37 = data2[(alu3+3457)];
    var val38 = data2[(alu3+3458)];
    var val39 = data2[(alu3+3459)];
    var val40 = data2[(alu3+3460)];
    var val41 = data2[(alu3+3461)];
    var val42 = data2[(alu3+3462)];
    var val43 = data2[(alu3+3463)];
    var val44 = data2[(alu3+3464)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast2 = gidx2;
  var precast3 = lidx0;
  var precast4 = (bitcast<u32>(precast2)<<7u);
  var precast5 = (bitcast<u32>(precast3)<<2u);
  var alu9 = (bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val45 = data5[alu9];
  var val46 = data3[alu9];
  var val47 = data4[alu9];
  var val48 = data6[alu9];
  var alu10 = (alu9+1);
  var val49 = data5[alu10];
  var val50 = data3[alu10];
  var val51 = data4[alu10];
  var val52 = data6[alu10];
  var alu11 = (alu9+2);
  var val53 = data5[alu11];
  var val54 = data3[alu11];
  var val55 = data4[alu11];
  var val56 = data6[alu11];
  var alu12 = (alu9+3);
  var val57 = data5[alu12];
  var val58 = data3[alu12];
  var val59 = data4[alu12];
  var val60 = data6[alu12];
  var alu13 = ((lidx0*676)+gidx0+(gidx1*13)+(gidx2*21632));
  var alu14 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu13] = (alu14*(1/(1.0f+exp2((alu14*-1.4426950408889634f)))));
  var alu16 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu13+169)] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu13+338)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu13+507)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
}`;

const r_2_169_32_64_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx1;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = lidx0;
  var cast1 = bitcast<u32>(precast1);
  var precast2 = (cast0<<15u);
  var precast3 = (cast1<<10u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 64; ridx3++) {
    var precast4 = ridx3;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = (gidx0+(ridx3*676));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast5)+bitcast<i32>(precast2)+bitcast<i32>(precast3));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+169)];
    var val3 = data1[(alu0+338)];
    var val4 = data1[(alu0+507)];
    var val5 = data2[(alu1+1)];
    var val6 = data2[(alu1+2)];
    var val7 = data2[(alu1+3)];
    var val8 = data2[(alu1+256)];
    var val9 = data2[(alu1+257)];
    var val10 = data2[(alu1+258)];
    var val11 = data2[(alu1+259)];
    var val12 = data2[(alu1+512)];
    var val13 = data2[(alu1+513)];
    var val14 = data2[(alu1+514)];
    var val15 = data2[(alu1+515)];
    var val16 = data2[(alu1+768)];
    var val17 = data2[(alu1+769)];
    var val18 = data2[(alu1+770)];
    var val19 = data2[(alu1+771)];
    acc0 = (acc0+(val0*val1)+(val2*val5)+(val3*val6)+(val4*val7));
    acc1 = (acc1+(val0*val8)+(val2*val9)+(val3*val10)+(val4*val11));
    acc2 = (acc2+(val0*val12)+(val2*val13)+(val3*val14)+(val4*val15));
    acc3 = (acc3+(val0*val16)+(val2*val17)+(val3*val18)+(val4*val19));
  }
  var precast6 = (cast0<<7u);
  var precast7 = (cast1<<2u);
  var alu7 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val20 = data5[alu7];
  var val21 = data3[alu7];
  var val22 = data4[alu7];
  var val23 = data6[alu7];
  var alu8 = (alu7+1);
  var val24 = data5[alu8];
  var val25 = data3[alu8];
  var val26 = data4[alu8];
  var val27 = data6[alu8];
  var alu9 = (alu7+2);
  var val28 = data5[alu9];
  var val29 = data3[alu9];
  var val30 = data4[alu9];
  var val31 = data6[alu9];
  var alu10 = (alu7+3);
  var val32 = data5[alu10];
  var val33 = data3[alu10];
  var val34 = data4[alu10];
  var val35 = data6[alu10];
  var alu11 = ((lidx0*676)+gidx0+(gidx1*21632));
  var alu12 = (((acc0-val21)*val22*(f32((1/sqrt((val20+(f16(0.001f))))))))+val23);
  data0[alu11] = (alu12*(1/(1.0f+exp2((alu12*-1.4426950408889634f)))));
  var alu14 = (((acc1-val25)*val26*(f32((1/sqrt((val24+(f16(0.001f))))))))+val27);
  data0[(alu11+169)] = (alu14*(1/(1.0f+exp2((alu14*-1.4426950408889634f)))));
  var alu16 = (((acc2-val29)*val30*(f32((1/sqrt((val28+(f16(0.001f))))))))+val31);
  data0[(alu11+338)] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc3-val33)*val34*(f32((1/sqrt((val32+(f16(0.001f))))))))+val35);
  data0[(alu11+507)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
}`;

const r_13_13_32_128_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 128; ridx3++) {
    var alu5 = (gidx0+alu0+(ridx3*169));
    var alu6 = ((lidx0*4608)+(ridx3*9));
    var val0 = data2[alu6];
    var val1 = select(0.0f, data1[(alu5+21618)], (alu1&alu2));
    var val2 = select(0.0f, data1[(alu5+21619)], alu1);
    var val3 = select(0.0f, data1[(alu5+21620)], (alu1&alu4));
    var val4 = select(0.0f, data1[(alu5+21631)], alu2);
    var val5 = data1[(alu5+21632)];
    var val6 = select(0.0f, data1[(alu5+21633)], alu4);
    var val7 = select(0.0f, data1[(alu5+21644)], (alu3&alu2));
    var val8 = select(0.0f, data1[(alu5+21645)], alu3);
    var val9 = select(0.0f, data1[(alu5+21646)], (alu3&alu4));
    var val10 = data2[(alu6+1)];
    var val11 = data2[(alu6+2)];
    var val12 = data2[(alu6+3)];
    var val13 = data2[(alu6+4)];
    var val14 = data2[(alu6+5)];
    var val15 = data2[(alu6+6)];
    var val16 = data2[(alu6+7)];
    var val17 = data2[(alu6+8)];
    var val18 = data2[(alu6+1152)];
    var val19 = data2[(alu6+1153)];
    var val20 = data2[(alu6+1154)];
    var val21 = data2[(alu6+1155)];
    var val22 = data2[(alu6+1156)];
    var val23 = data2[(alu6+1157)];
    var val24 = data2[(alu6+1158)];
    var val25 = data2[(alu6+1159)];
    var val26 = data2[(alu6+1160)];
    var val27 = data2[(alu6+2304)];
    var val28 = data2[(alu6+2305)];
    var val29 = data2[(alu6+2306)];
    var val30 = data2[(alu6+2307)];
    var val31 = data2[(alu6+2308)];
    var val32 = data2[(alu6+2309)];
    var val33 = data2[(alu6+2310)];
    var val34 = data2[(alu6+2311)];
    var val35 = data2[(alu6+2312)];
    var val36 = data2[(alu6+3456)];
    var val37 = data2[(alu6+3457)];
    var val38 = data2[(alu6+3458)];
    var val39 = data2[(alu6+3459)];
    var val40 = data2[(alu6+3460)];
    var val41 = data2[(alu6+3461)];
    var val42 = data2[(alu6+3462)];
    var val43 = data2[(alu6+3463)];
    var val44 = data2[(alu6+3464)];
    acc0 = (acc0+(val1*val0)+(val4*val12)+(val7*val15)+(val2*val10)+(val5*val13)+(val8*val16)+(val3*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val1*val18)+(val4*val21)+(val7*val24)+(val2*val19)+(val5*val22)+(val8*val25)+(val3*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val1*val27)+(val4*val30)+(val7*val33)+(val2*val28)+(val5*val31)+(val8*val34)+(val3*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val1*val36)+(val4*val39)+(val7*val42)+(val2*val37)+(val5*val40)+(val8*val43)+(val3*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val45 = data5[cast0];
  var val46 = data3[cast0];
  var val47 = data4[cast0];
  var val48 = data6[cast0];
  var alu12 = (cast0+1);
  var val49 = data5[alu12];
  var val50 = data3[alu12];
  var val51 = data4[alu12];
  var val52 = data6[alu12];
  var alu13 = (cast0+2);
  var val53 = data5[alu13];
  var val54 = data3[alu13];
  var val55 = data4[alu13];
  var val56 = data6[alu13];
  var alu14 = (cast0+3);
  var val57 = data5[alu14];
  var val58 = data3[alu14];
  var val59 = data4[alu14];
  var val60 = data6[alu14];
  var alu15 = ((lidx0*676)+gidx0+alu0);
  var alu16 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu15] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu15+169)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu15+338)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu15+507)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
}`;

const r_13_13_32_128_4_3_3n1 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f16>;
@group(0) @binding(8)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 128; ridx3++) {
    var alu5 = (gidx0+alu0+(ridx3*169));
    var val0 = data2[alu5];
    var alu6 = ((lidx0*4608)+(ridx3*9));
    var val1 = data3[alu6];
    var val2 = select(0.0f, data2[(alu5+-14)], (alu1&alu2));
    var val3 = select(0.0f, data2[(alu5+-13)], alu1);
    var val4 = select(0.0f, data2[(alu5+-12)], (alu1&alu4));
    var val5 = select(0.0f, data2[(alu5+-1)], alu2);
    var val6 = select(0.0f, data2[(alu5+1)], alu4);
    var val7 = select(0.0f, data2[(alu5+12)], (alu3&alu2));
    var val8 = select(0.0f, data2[(alu5+13)], alu3);
    var val9 = select(0.0f, data2[(alu5+14)], (alu3&alu4));
    var val10 = data3[(alu6+1)];
    var val11 = data3[(alu6+2)];
    var val12 = data3[(alu6+3)];
    var val13 = data3[(alu6+4)];
    var val14 = data3[(alu6+5)];
    var val15 = data3[(alu6+6)];
    var val16 = data3[(alu6+7)];
    var val17 = data3[(alu6+8)];
    var val18 = data3[(alu6+1152)];
    var val19 = data3[(alu6+1153)];
    var val20 = data3[(alu6+1154)];
    var val21 = data3[(alu6+1155)];
    var val22 = data3[(alu6+1156)];
    var val23 = data3[(alu6+1157)];
    var val24 = data3[(alu6+1158)];
    var val25 = data3[(alu6+1159)];
    var val26 = data3[(alu6+1160)];
    var val27 = data3[(alu6+2304)];
    var val28 = data3[(alu6+2305)];
    var val29 = data3[(alu6+2306)];
    var val30 = data3[(alu6+2307)];
    var val31 = data3[(alu6+2308)];
    var val32 = data3[(alu6+2309)];
    var val33 = data3[(alu6+2310)];
    var val34 = data3[(alu6+2311)];
    var val35 = data3[(alu6+2312)];
    var val36 = data3[(alu6+3456)];
    var val37 = data3[(alu6+3457)];
    var val38 = data3[(alu6+3458)];
    var val39 = data3[(alu6+3459)];
    var val40 = data3[(alu6+3460)];
    var val41 = data3[(alu6+3461)];
    var val42 = data3[(alu6+3462)];
    var val43 = data3[(alu6+3463)];
    var val44 = data3[(alu6+3464)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val45 = data6[cast0];
  var val46 = data4[cast0];
  var val47 = data5[cast0];
  var val48 = data7[cast0];
  var alu12 = (cast0+1);
  var val49 = data6[alu12];
  var val50 = data4[alu12];
  var val51 = data5[alu12];
  var val52 = data7[alu12];
  var alu13 = (cast0+2);
  var val53 = data6[alu13];
  var val54 = data4[alu13];
  var val55 = data5[alu13];
  var val56 = data7[alu13];
  var alu14 = (cast0+3);
  var val57 = data6[alu14];
  var val58 = data4[alu14];
  var val59 = data5[alu14];
  var val60 = data7[alu14];
  var alu15 = ((lidx0*676)+gidx0+alu0);
  var val61 = data1[(alu15+21632)];
  var val62 = data1[(alu15+21801)];
  var val63 = data1[(alu15+21970)];
  var val64 = data1[(alu15+22139)];
  var alu16 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu15] = (val61+(alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f))))));
  var alu18 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu15+169)] = (val62+(alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f))))));
  var alu20 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu15+338)] = (val63+(alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f))))));
  var alu22 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu15+507)] = (val64+(alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f))))));
}`;

const E_12_169_32 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 12 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((lidx0*169)+gidx0+(gidx1*5408));
  var alu1 = (gidx1<4);
  var val0 = select(0.0f, data1[alu0], alu1);
  var alu2 = (gidx1<8);
  var val1 = select(0.0f, data2[(alu0+-43264)], (alu2!=true));
  var val2 = select(0.0f, data1[alu0], ((alu1!=true)&alu2));
  data0[alu0] = (val0+val2+val1);
}`;

const r_2_169_32_96_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 32 */
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 96; ridx3++) {
    var precast0 = ridx3;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = (gidx0+(ridx3*676));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast1)+(gidx1*49152)+(lidx0*1536));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+169)];
    var val3 = data1[(alu0+338)];
    var val4 = data1[(alu0+507)];
    var val5 = data2[(alu1+1)];
    var val6 = data2[(alu1+2)];
    var val7 = data2[(alu1+3)];
    var val8 = data2[(alu1+384)];
    var val9 = data2[(alu1+385)];
    var val10 = data2[(alu1+386)];
    var val11 = data2[(alu1+387)];
    var val12 = data2[(alu1+768)];
    var val13 = data2[(alu1+769)];
    var val14 = data2[(alu1+770)];
    var val15 = data2[(alu1+771)];
    var val16 = data2[(alu1+1152)];
    var val17 = data2[(alu1+1153)];
    var val18 = data2[(alu1+1154)];
    var val19 = data2[(alu1+1155)];
    acc0 = (acc0+(val0*val1)+(val2*val5)+(val3*val6)+(val4*val7));
    acc1 = (acc1+(val0*val8)+(val2*val9)+(val3*val10)+(val4*val11));
    acc2 = (acc2+(val0*val12)+(val2*val13)+(val3*val14)+(val4*val15));
    acc3 = (acc3+(val0*val16)+(val2*val17)+(val3*val18)+(val4*val19));
  }
  var precast2 = gidx1;
  var precast3 = lidx0;
  var precast4 = (bitcast<u32>(precast2)<<7u);
  var precast5 = (bitcast<u32>(precast3)<<2u);
  var alu7 = (bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val20 = data5[alu7];
  var val21 = data3[alu7];
  var val22 = data4[alu7];
  var val23 = data6[alu7];
  var alu8 = (alu7+1);
  var val24 = data5[alu8];
  var val25 = data3[alu8];
  var val26 = data4[alu8];
  var val27 = data6[alu8];
  var alu9 = (alu7+2);
  var val28 = data5[alu9];
  var val29 = data3[alu9];
  var val30 = data4[alu9];
  var val31 = data6[alu9];
  var alu10 = (alu7+3);
  var val32 = data5[alu10];
  var val33 = data3[alu10];
  var val34 = data4[alu10];
  var val35 = data6[alu10];
  var alu11 = ((lidx0*676)+gidx0+(gidx1*21632));
  var alu12 = (((acc0-val21)*val22*(f32((1/sqrt((val20+(f16(0.001f))))))))+val23);
  data0[alu11] = (alu12*(1/(1.0f+exp2((alu12*-1.4426950408889634f)))));
  var alu14 = (((acc1-val25)*val26*(f32((1/sqrt((val24+(f16(0.001f))))))))+val27);
  data0[(alu11+169)] = (alu14*(1/(1.0f+exp2((alu14*-1.4426950408889634f)))));
  var alu16 = (((acc2-val29)*val30*(f32((1/sqrt((val28+(f16(0.001f))))))))+val31);
  data0[(alu11+338)] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc3-val33)*val34*(f32((1/sqrt((val32+(f16(0.001f))))))))+val35);
  data0[(alu11+507)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
}`;

const r_169_32_64_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = lidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = (cast0<<10u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx2 = 0; ridx2 < 64; ridx2++) {
    var precast2 = ridx2;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu0 = (gidx0+(ridx2*676));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast1)+bitcast<i32>(precast3));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+169)];
    var val3 = data1[(alu0+338)];
    var val4 = data1[(alu0+507)];
    var val5 = data2[(alu1+1)];
    var val6 = data2[(alu1+2)];
    var val7 = data2[(alu1+3)];
    var val8 = data2[(alu1+256)];
    var val9 = data2[(alu1+257)];
    var val10 = data2[(alu1+258)];
    var val11 = data2[(alu1+259)];
    var val12 = data2[(alu1+512)];
    var val13 = data2[(alu1+513)];
    var val14 = data2[(alu1+514)];
    var val15 = data2[(alu1+515)];
    var val16 = data2[(alu1+768)];
    var val17 = data2[(alu1+769)];
    var val18 = data2[(alu1+770)];
    var val19 = data2[(alu1+771)];
    acc0 = (acc0+(val0*val1)+(val2*val5)+(val3*val6)+(val4*val7));
    acc1 = (acc1+(val0*val8)+(val2*val9)+(val3*val10)+(val4*val11));
    acc2 = (acc2+(val0*val12)+(val2*val13)+(val3*val14)+(val4*val15));
    acc3 = (acc3+(val0*val16)+(val2*val17)+(val3*val18)+(val4*val19));
  }
  var precast4 = (cast0<<2u);
  var cast1 = bitcast<i32>(precast4);
  var val20 = data5[cast1];
  var val21 = data3[cast1];
  var val22 = data4[cast1];
  var val23 = data6[cast1];
  var alu7 = (cast1+1);
  var val24 = data5[alu7];
  var val25 = data3[alu7];
  var val26 = data4[alu7];
  var val27 = data6[alu7];
  var alu8 = (cast1+2);
  var val28 = data5[alu8];
  var val29 = data3[alu8];
  var val30 = data4[alu8];
  var val31 = data6[alu8];
  var alu9 = (cast1+3);
  var val32 = data5[alu9];
  var val33 = data3[alu9];
  var val34 = data4[alu9];
  var val35 = data6[alu9];
  var alu10 = (gidx0+(lidx0*676));
  var alu11 = (((acc0-val21)*val22*(f32((1/sqrt((val20+(f16(0.001f))))))))+val23);
  data0[alu10] = (alu11*(1/(1.0f+exp2((alu11*-1.4426950408889634f)))));
  var alu13 = (((acc1-val25)*val26*(f32((1/sqrt((val24+(f16(0.001f))))))))+val27);
  data0[(alu10+169)] = (alu13*(1/(1.0f+exp2((alu13*-1.4426950408889634f)))));
  var alu15 = (((acc2-val29)*val30*(f32((1/sqrt((val28+(f16(0.001f))))))))+val31);
  data0[(alu10+338)] = (alu15*(1/(1.0f+exp2((alu15*-1.4426950408889634f)))));
  var alu17 = (((acc3-val33)*val34*(f32((1/sqrt((val32+(f16(0.001f))))))))+val35);
  data0[(alu10+507)] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
}`;

const r_4_13_13_32_5_5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 4 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (lidx0*169);
  var alu1 = (gidx1*13);
  var alu2 = (gidx2*5408);
  var acc0 = (f32(-INFINITY));
  for (var ridx4 = 0; ridx4 < 5; ridx4++) {
    var alu3 = (gidx1+ridx4);
    var alu4 = (gidx0+alu1+(ridx4*13)+alu2+alu0);
    var alu5 = (((alu3<2)!=true)&(alu3<15));
    var val0 = select(0.0f, data1[(alu4+-26)], alu5);
    var val1 = select(0.0f, data1[(alu4+-24)], (alu5&(gidx0<11)));
    var val2 = select(0.0f, data1[(alu4+-25)], (alu5&(gidx0<12)));
    var val3 = select(0.0f, data1[(alu4+-27)], (alu5&((gidx0<1)!=true)));
    var val4 = select(0.0f, data1[(alu4+-28)], (alu5&((gidx0<2)!=true)));
    var alu6 = select(acc0,val4,(acc0<val4));
    var alu7 = select(alu6,val3,(alu6<val3));
    var alu8 = select(alu7,val0,(alu7<val0));
    var alu9 = select(alu8,val2,(alu8<val2));
    acc0 = select(alu9,val1,(alu9<val1));
  }
  data0[(alu0+gidx0+alu1+alu2)] = acc0;
}`;

const E_16_169_32 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((lidx0*169)+gidx0+(gidx1*5408));
  var alu1 = (gidx1<4);
  var val0 = select(0.0f, data1[alu0], alu1);
  var alu2 = (gidx1<8);
  var alu3 = (gidx1<12);
  var val1 = select(0.0f, data4[(alu0+-64896)], (alu3!=true));
  var val2 = select(0.0f, data2[(alu0+-21632)], ((alu1!=true)&alu2));
  var val3 = select(0.0f, data3[(alu0+-43264)], ((alu2!=true)&alu3));
  data0[alu0] = (val0+val2+val3+val1);
}`;

const r_2_169_32_128_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx1;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = lidx0;
  var cast1 = bitcast<u32>(precast1);
  var precast2 = (cast0<<16u);
  var precast3 = (cast1<<11u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 128; ridx3++) {
    var precast4 = ridx3;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = (gidx0+(ridx3*676));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast5)+bitcast<i32>(precast2)+bitcast<i32>(precast3));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+169)];
    var val3 = data1[(alu0+338)];
    var val4 = data1[(alu0+507)];
    var val5 = data2[(alu1+1)];
    var val6 = data2[(alu1+2)];
    var val7 = data2[(alu1+3)];
    var val8 = data2[(alu1+512)];
    var val9 = data2[(alu1+513)];
    var val10 = data2[(alu1+514)];
    var val11 = data2[(alu1+515)];
    var val12 = data2[(alu1+1024)];
    var val13 = data2[(alu1+1025)];
    var val14 = data2[(alu1+1026)];
    var val15 = data2[(alu1+1027)];
    var val16 = data2[(alu1+1536)];
    var val17 = data2[(alu1+1537)];
    var val18 = data2[(alu1+1538)];
    var val19 = data2[(alu1+1539)];
    acc0 = (acc0+(val0*val1)+(val2*val5)+(val3*val6)+(val4*val7));
    acc1 = (acc1+(val0*val8)+(val2*val9)+(val3*val10)+(val4*val11));
    acc2 = (acc2+(val0*val12)+(val2*val13)+(val3*val14)+(val4*val15));
    acc3 = (acc3+(val0*val16)+(val2*val17)+(val3*val18)+(val4*val19));
  }
  var precast6 = (cast0<<7u);
  var precast7 = (cast1<<2u);
  var alu7 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val20 = data5[alu7];
  var val21 = data3[alu7];
  var val22 = data4[alu7];
  var val23 = data6[alu7];
  var alu8 = (alu7+1);
  var val24 = data5[alu8];
  var val25 = data3[alu8];
  var val26 = data4[alu8];
  var val27 = data6[alu8];
  var alu9 = (alu7+2);
  var val28 = data5[alu9];
  var val29 = data3[alu9];
  var val30 = data4[alu9];
  var val31 = data6[alu9];
  var alu10 = (alu7+3);
  var val32 = data5[alu10];
  var val33 = data3[alu10];
  var val34 = data4[alu10];
  var val35 = data6[alu10];
  var alu11 = ((lidx0*676)+gidx0+(gidx1*21632));
  var alu12 = (((acc0-val21)*val22*(f32((1/sqrt((val20+(f16(0.001f))))))))+val23);
  data0[alu11] = (alu12*(1/(1.0f+exp2((alu12*-1.4426950408889634f)))));
  var alu14 = (((acc1-val25)*val26*(f32((1/sqrt((val24+(f16(0.001f))))))))+val27);
  data0[(alu11+169)] = (alu14*(1/(1.0f+exp2((alu14*-1.4426950408889634f)))));
  var alu16 = (((acc2-val29)*val30*(f32((1/sqrt((val28+(f16(0.001f))))))))+val31);
  data0[(alu11+338)] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc3-val33)*val34*(f32((1/sqrt((val32+(f16(0.001f))))))))+val35);
  data0[(alu11+507)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
}`;

const E_12_13_13_32_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 12 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var alu0 = (lidx2+(lidx1*26)+(lidx0*676)+bitcast<i32>(precast1)+(gidx1*52)+(gidx2*21632));
  var alu1 = (gidx2<8);
  var val0 = select(0.0f, data1[(gidx0+(gidx2*5408)+(gidx1*13)+(lidx0*169))], alu1);
  var val1 = select(0.0f, data2[(alu0+-173056)], (alu1!=true));
  data0[alu0] = (val0+val1);
}`;

const r_169_32_96_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx2 = 0; ridx2 < 96; ridx2++) {
    var precast2 = ridx2;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu0 = (cast0+(ridx2*2704));
    var val0 = data1[alu0];
    var alu1 = ((lidx0*1536)+bitcast<i32>(precast3));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+1)];
    var val3 = data1[(alu0+2)];
    var val4 = data1[(alu0+3)];
    var val5 = data1[(alu0+676)];
    var val6 = data1[(alu0+677)];
    var val7 = data1[(alu0+678)];
    var val8 = data1[(alu0+679)];
    var val9 = data1[(alu0+1352)];
    var val10 = data1[(alu0+1353)];
    var val11 = data1[(alu0+1354)];
    var val12 = data1[(alu0+1355)];
    var val13 = data1[(alu0+2028)];
    var val14 = data1[(alu0+2029)];
    var val15 = data1[(alu0+2030)];
    var val16 = data1[(alu0+2031)];
    var val17 = data2[(alu1+1)];
    var val18 = data2[(alu1+2)];
    var val19 = data2[(alu1+3)];
    var val20 = data2[(alu1+384)];
    var val21 = data2[(alu1+385)];
    var val22 = data2[(alu1+386)];
    var val23 = data2[(alu1+387)];
    var val24 = data2[(alu1+768)];
    var val25 = data2[(alu1+769)];
    var val26 = data2[(alu1+770)];
    var val27 = data2[(alu1+771)];
    var val28 = data2[(alu1+1152)];
    var val29 = data2[(alu1+1153)];
    var val30 = data2[(alu1+1154)];
    var val31 = data2[(alu1+1155)];
    acc0 = (acc0+(val0*val1)+(val5*val17)+(val9*val18)+(val13*val19));
    acc1 = (acc1+(val0*val20)+(val5*val21)+(val9*val22)+(val13*val23));
    acc2 = (acc2+(val0*val24)+(val5*val25)+(val9*val26)+(val13*val27));
    acc3 = (acc3+(val0*val28)+(val5*val29)+(val9*val30)+(val13*val31));
    acc4 = (acc4+(val2*val1)+(val6*val17)+(val10*val18)+(val14*val19));
    acc5 = (acc5+(val2*val20)+(val6*val21)+(val10*val22)+(val14*val23));
    acc6 = (acc6+(val2*val24)+(val6*val25)+(val10*val26)+(val14*val27));
    acc7 = (acc7+(val2*val28)+(val6*val29)+(val10*val30)+(val14*val31));
    acc8 = (acc8+(val3*val1)+(val7*val17)+(val11*val18)+(val15*val19));
    acc9 = (acc9+(val3*val20)+(val7*val21)+(val11*val22)+(val15*val23));
    acc10 = (acc10+(val3*val24)+(val7*val25)+(val11*val26)+(val15*val27));
    acc11 = (acc11+(val3*val28)+(val7*val29)+(val11*val30)+(val15*val31));
    acc12 = (acc12+(val4*val1)+(val8*val17)+(val12*val18)+(val16*val19));
    acc13 = (acc13+(val4*val20)+(val8*val21)+(val12*val22)+(val16*val23));
    acc14 = (acc14+(val4*val24)+(val8*val25)+(val12*val26)+(val16*val27));
    acc15 = (acc15+(val4*val28)+(val8*val29)+(val12*val30)+(val16*val31));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val32 = data5[cast1];
  var val33 = data3[cast1];
  var val34 = data4[cast1];
  var val35 = data6[cast1];
  var alu19 = (cast1+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast1+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast1+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+(lidx0*2704));
  var cast2 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast2)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast3)+val39);
  data0[(alu22+676)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast4)+val43);
  data0[(alu22+1352)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast5)+val47);
  data0[(alu22+2028)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast2)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast3)+val39);
  data0[(alu22+677)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast4)+val43);
  data0[(alu22+1353)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast5)+val47);
  data0[(alu22+2029)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast2)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast3)+val39);
  data0[(alu22+678)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast4)+val43);
  data0[(alu22+1354)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast5)+val47);
  data0[(alu22+2030)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast2)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast3)+val39);
  data0[(alu22+679)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast4)+val43);
  data0[(alu22+1355)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast5)+val47);
  data0[(alu22+2031)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const E_6_169_32_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 6 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var alu0 = ((lidx0*676)+bitcast<i32>(precast1)+(gidx1*21632));
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var alu3 = (alu0+3);
  var alu4 = (gidx1<2);
  var val0 = select(0.0f, data1[alu0], alu4);
  var val1 = select(0.0f, data1[alu1], alu4);
  var val2 = select(0.0f, data1[alu2], alu4);
  var val3 = select(0.0f, data1[alu3], alu4);
  var alu5 = (gidx1<4);
  var alu6 = (alu5!=true);
  var val4 = select(0.0f, data2[(alu0+-86528)], alu6);
  var val5 = select(0.0f, data2[(alu0+-86527)], alu6);
  var val6 = select(0.0f, data2[(alu0+-86526)], alu6);
  var val7 = select(0.0f, data2[(alu0+-86525)], alu6);
  var alu7 = ((alu4!=true)&alu5);
  var val8 = select(0.0f, data1[alu0], alu7);
  var val9 = select(0.0f, data1[alu1], alu7);
  var val10 = select(0.0f, data1[alu2], alu7);
  var val11 = select(0.0f, data1[alu3], alu7);
  data0[alu0] = (val0+val8+val4);
  data0[alu1] = (val1+val9+val5);
  data0[alu2] = (val2+val10+val6);
  data0[alu3] = (val3+val11+val7);
}`;

const r_169_32_48_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx2 = 0; ridx2 < 48; ridx2++) {
    var precast2 = ridx2;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu0 = (cast0+(ridx2*2704));
    var val0 = data1[alu0];
    var alu1 = ((lidx0*768)+bitcast<i32>(precast3));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+1)];
    var val3 = data1[(alu0+2)];
    var val4 = data1[(alu0+3)];
    var val5 = data1[(alu0+676)];
    var val6 = data1[(alu0+677)];
    var val7 = data1[(alu0+678)];
    var val8 = data1[(alu0+679)];
    var val9 = data1[(alu0+1352)];
    var val10 = data1[(alu0+1353)];
    var val11 = data1[(alu0+1354)];
    var val12 = data1[(alu0+1355)];
    var val13 = data1[(alu0+2028)];
    var val14 = data1[(alu0+2029)];
    var val15 = data1[(alu0+2030)];
    var val16 = data1[(alu0+2031)];
    var val17 = data2[(alu1+1)];
    var val18 = data2[(alu1+2)];
    var val19 = data2[(alu1+3)];
    var val20 = data2[(alu1+192)];
    var val21 = data2[(alu1+193)];
    var val22 = data2[(alu1+194)];
    var val23 = data2[(alu1+195)];
    var val24 = data2[(alu1+384)];
    var val25 = data2[(alu1+385)];
    var val26 = data2[(alu1+386)];
    var val27 = data2[(alu1+387)];
    var val28 = data2[(alu1+576)];
    var val29 = data2[(alu1+577)];
    var val30 = data2[(alu1+578)];
    var val31 = data2[(alu1+579)];
    acc0 = (acc0+(val0*val1)+(val5*val17)+(val9*val18)+(val13*val19));
    acc1 = (acc1+(val0*val20)+(val5*val21)+(val9*val22)+(val13*val23));
    acc2 = (acc2+(val0*val24)+(val5*val25)+(val9*val26)+(val13*val27));
    acc3 = (acc3+(val0*val28)+(val5*val29)+(val9*val30)+(val13*val31));
    acc4 = (acc4+(val2*val1)+(val6*val17)+(val10*val18)+(val14*val19));
    acc5 = (acc5+(val2*val20)+(val6*val21)+(val10*val22)+(val14*val23));
    acc6 = (acc6+(val2*val24)+(val6*val25)+(val10*val26)+(val14*val27));
    acc7 = (acc7+(val2*val28)+(val6*val29)+(val10*val30)+(val14*val31));
    acc8 = (acc8+(val3*val1)+(val7*val17)+(val11*val18)+(val15*val19));
    acc9 = (acc9+(val3*val20)+(val7*val21)+(val11*val22)+(val15*val23));
    acc10 = (acc10+(val3*val24)+(val7*val25)+(val11*val26)+(val15*val27));
    acc11 = (acc11+(val3*val28)+(val7*val29)+(val11*val30)+(val15*val31));
    acc12 = (acc12+(val4*val1)+(val8*val17)+(val12*val18)+(val16*val19));
    acc13 = (acc13+(val4*val20)+(val8*val21)+(val12*val22)+(val16*val23));
    acc14 = (acc14+(val4*val24)+(val8*val25)+(val12*val26)+(val16*val27));
    acc15 = (acc15+(val4*val28)+(val8*val29)+(val12*val30)+(val16*val31));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val32 = data5[cast1];
  var val33 = data3[cast1];
  var val34 = data4[cast1];
  var val35 = data6[cast1];
  var alu19 = (cast1+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast1+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast1+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+(lidx0*2704));
  var cast2 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast2)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast3)+val39);
  data0[(alu22+676)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast4)+val43);
  data0[(alu22+1352)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast5)+val47);
  data0[(alu22+2028)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast2)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast3)+val39);
  data0[(alu22+677)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast4)+val43);
  data0[(alu22+1353)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast5)+val47);
  data0[(alu22+2029)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast2)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast3)+val39);
  data0[(alu22+678)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast4)+val43);
  data0[(alu22+1354)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast5)+val47);
  data0[(alu22+2030)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast2)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast3)+val39);
  data0[(alu22+679)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast4)+val43);
  data0[(alu22+1355)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast5)+val47);
  data0[(alu22+2031)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const E_6_13_13_32_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 6 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = (cast0<<1u);
  var precast2 = (cast0<<2u);
  var alu0 = ((lidx1*52)+(lidx0*2704)+bitcast<i32>(precast2)+(gidx1*208)+(gidx2*86528));
  var alu1 = (bitcast<i32>(precast1)+((lidx1>>1)*26)+(gidx2*21632)+(gidx1*52)+(lidx0*676));
  var alu2 = (gidx2<4);
  var val0 = select(0.0f, data1[alu1], alu2);
  var val1 = select(0.0f, data1[(alu1+1)], alu2);
  var alu3 = (alu2!=true);
  var val2 = select(0.0f, data2[(alu0+-346112)], alu3);
  var val3 = select(0.0f, data2[(alu0+-346111)], alu3);
  var val4 = select(0.0f, data2[(alu0+-346110)], alu3);
  var val5 = select(0.0f, data2[(alu0+-346109)], alu3);
  data0[alu0] = (val0+val2);
  data0[(alu0+1)] = (val0+val3);
  data0[(alu0+2)] = (val1+val4);
  data0[(alu0+3)] = (val1+val5);
}`;

const r_169_16_4_48_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  var cast1 = bitcast<i32>(precast3);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 48; ridx3++) {
    var precast4 = ridx3;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = ((lidx0*768)+bitcast<i32>(precast5));
    var val0 = data2[alu0];
    var alu1 = ((ridx3*10816)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+192)];
    var val6 = data2[(alu0+193)];
    var val7 = data2[(alu0+194)];
    var val8 = data2[(alu0+195)];
    var val9 = data2[(alu0+384)];
    var val10 = data2[(alu0+385)];
    var val11 = data2[(alu0+386)];
    var val12 = data2[(alu0+387)];
    var val13 = data2[(alu0+576)];
    var val14 = data2[(alu0+577)];
    var val15 = data2[(alu0+578)];
    var val16 = data2[(alu0+579)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+2704)];
    var val21 = data1[(alu1+2705)];
    var val22 = data1[(alu1+2706)];
    var val23 = data1[(alu1+2707)];
    var val24 = data1[(alu1+5408)];
    var val25 = data1[(alu1+5409)];
    var val26 = data1[(alu1+5410)];
    var val27 = data1[(alu1+5411)];
    var val28 = data1[(alu1+8112)];
    var val29 = data1[(alu1+8113)];
    var val30 = data1[(alu1+8114)];
    var val31 = data1[(alu1+8115)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast6 = lidx0;
  var precast7 = (bitcast<u32>(precast6)<<2u);
  var cast2 = bitcast<i32>(precast7);
  var val32 = data5[cast2];
  var val33 = data3[cast2];
  var val34 = data4[cast2];
  var val35 = data6[cast2];
  var alu19 = (cast2+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast2+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast2+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+cast1+(lidx0*10816));
  var cast3 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast3)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast4)+val39);
  data0[(alu22+2704)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast5)+val43);
  data0[(alu22+5408)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast6)+val47);
  data0[(alu22+8112)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast3)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast4)+val39);
  data0[(alu22+2705)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast5)+val43);
  data0[(alu22+5409)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast6)+val47);
  data0[(alu22+8113)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast3)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast4)+val39);
  data0[(alu22+2706)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast5)+val43);
  data0[(alu22+5410)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast6)+val47);
  data0[(alu22+8114)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast3)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast4)+val39);
  data0[(alu22+2707)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast5)+val43);
  data0[(alu22+5411)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast6)+val47);
  data0[(alu22+8115)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const E_3_169_32_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 3 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx1;
  var alu0 = (lidx0*2704);
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var cast0 = bitcast<i32>(precast2);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var cast1 = bitcast<i32>(precast3);
  var alu1 = (cast1+cast0+alu0);
  var alu2 = (alu1+1);
  var alu3 = (alu1+2);
  var alu4 = (alu1+3);
  var alu5 = (gidx1<1);
  var val0 = select(0.0f, data1[alu1], alu5);
  var val1 = select(0.0f, data1[alu2], alu5);
  var val2 = select(0.0f, data1[alu3], alu5);
  var val3 = select(0.0f, data1[alu4], alu5);
  var alu6 = (gidx1<2);
  var alu7 = (alu6!=true);
  var val4 = select(0.0f, data2[alu1], alu7);
  var val5 = select(0.0f, data2[alu2], alu7);
  var val6 = select(0.0f, data2[alu3], alu7);
  var val7 = select(0.0f, data2[alu4], alu7);
  var alu8 = ((alu5!=true)&alu6);
  var val8 = select(0.0f, data1[(alu1+86528)], alu8);
  var val9 = select(0.0f, data1[(alu1+86529)], alu8);
  var val10 = select(0.0f, data1[(alu1+86530)], alu8);
  var val11 = select(0.0f, data1[(alu1+86531)], alu8);
  var alu9 = (cast1+alu0+cast0+(gidx1*86528));
  data0[alu9] = (val0+val8+val4);
  data0[(alu9+1)] = (val1+val9+val5);
  data0[(alu9+2)] = (val2+val10+val6);
  data0[(alu9+3)] = (val3+val11+val7);
}`;

const r_169_16_4_24_4_4_4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  var cast1 = bitcast<i32>(precast3);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 24; ridx3++) {
    var precast4 = ridx3;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = ((lidx0*384)+bitcast<i32>(precast5));
    var val0 = data2[alu0];
    var alu1 = ((ridx3*10816)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+96)];
    var val6 = data2[(alu0+97)];
    var val7 = data2[(alu0+98)];
    var val8 = data2[(alu0+99)];
    var val9 = data2[(alu0+192)];
    var val10 = data2[(alu0+193)];
    var val11 = data2[(alu0+194)];
    var val12 = data2[(alu0+195)];
    var val13 = data2[(alu0+288)];
    var val14 = data2[(alu0+289)];
    var val15 = data2[(alu0+290)];
    var val16 = data2[(alu0+291)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+2704)];
    var val21 = data1[(alu1+2705)];
    var val22 = data1[(alu1+2706)];
    var val23 = data1[(alu1+2707)];
    var val24 = data1[(alu1+5408)];
    var val25 = data1[(alu1+5409)];
    var val26 = data1[(alu1+5410)];
    var val27 = data1[(alu1+5411)];
    var val28 = data1[(alu1+8112)];
    var val29 = data1[(alu1+8113)];
    var val30 = data1[(alu1+8114)];
    var val31 = data1[(alu1+8115)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast6 = lidx0;
  var precast7 = (bitcast<u32>(precast6)<<2u);
  var cast2 = bitcast<i32>(precast7);
  var val32 = data5[cast2];
  var val33 = data3[cast2];
  var val34 = data4[cast2];
  var val35 = data6[cast2];
  var alu19 = (cast2+1);
  var val36 = data5[alu19];
  var val37 = data3[alu19];
  var val38 = data4[alu19];
  var val39 = data6[alu19];
  var alu20 = (cast2+2);
  var val40 = data5[alu20];
  var val41 = data3[alu20];
  var val42 = data4[alu20];
  var val43 = data6[alu20];
  var alu21 = (cast2+3);
  var val44 = data5[alu21];
  var val45 = data3[alu21];
  var val46 = data4[alu21];
  var val47 = data6[alu21];
  var alu22 = (cast0+cast1+(lidx0*10816));
  var cast3 = (f32((1/sqrt((val32+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val36+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val40+(f16(0.001f)))))));
  var cast6 = (f32((1/sqrt((val44+(f16(0.001f)))))));
  var alu23 = (((acc0-val33)*val34*cast3)+val35);
  data0[alu22] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc1-val37)*val38*cast4)+val39);
  data0[(alu22+2704)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
  var alu27 = (((acc2-val41)*val42*cast5)+val43);
  data0[(alu22+5408)] = (alu27*(1/(1.0f+exp2((alu27*-1.4426950408889634f)))));
  var alu29 = (((acc3-val45)*val46*cast6)+val47);
  data0[(alu22+8112)] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc4-val33)*val34*cast3)+val35);
  data0[(alu22+1)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc5-val37)*val38*cast4)+val39);
  data0[(alu22+2705)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc6-val41)*val42*cast5)+val43);
  data0[(alu22+5409)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc7-val45)*val46*cast6)+val47);
  data0[(alu22+8113)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc8-val33)*val34*cast3)+val35);
  data0[(alu22+2)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc9-val37)*val38*cast4)+val39);
  data0[(alu22+2706)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc10-val41)*val42*cast5)+val43);
  data0[(alu22+5410)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc11-val45)*val46*cast6)+val47);
  data0[(alu22+8114)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc12-val33)*val34*cast3)+val35);
  data0[(alu22+3)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc13-val37)*val38*cast4)+val39);
  data0[(alu22+2707)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc14-val41)*val42*cast5)+val43);
  data0[(alu22+5411)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc15-val45)*val46*cast6)+val47);
  data0[(alu22+8115)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
}`;

const r_13_13_16_4_64_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 64; ridx4++) {
    var alu6 = ((lidx0*2304)+(ridx4*9));
    var val0 = data2[alu6];
    var alu7 = (cast0+(ridx4*2704)+alu1+alu0);
    var val1 = data1[alu7];
    var val2 = select(0.0f, data1[(alu7+-53)], (alu2&alu3));
    var val3 = select(0.0f, data1[(alu7+-52)], alu2);
    var val4 = select(0.0f, data1[(alu7+-51)], alu2);
    var val5 = select(0.0f, data1[(alu7+-50)], alu2);
    var val6 = select(0.0f, data1[(alu7+-49)], alu2);
    var val7 = select(0.0f, data1[(alu7+-48)], (alu2&alu5));
    var val8 = select(0.0f, data1[(alu7+-1)], alu3);
    var val9 = data1[(alu7+1)];
    var val10 = data1[(alu7+2)];
    var val11 = data1[(alu7+3)];
    var val12 = select(0.0f, data1[(alu7+4)], alu5);
    var val13 = select(0.0f, data1[(alu7+51)], (alu4&alu3));
    var val14 = select(0.0f, data1[(alu7+52)], alu4);
    var val15 = select(0.0f, data1[(alu7+53)], alu4);
    var val16 = select(0.0f, data1[(alu7+54)], alu4);
    var val17 = select(0.0f, data1[(alu7+55)], alu4);
    var val18 = select(0.0f, data1[(alu7+56)], (alu4&alu5));
    var val19 = data2[(alu6+1)];
    var val20 = data2[(alu6+2)];
    var val21 = data2[(alu6+3)];
    var val22 = data2[(alu6+4)];
    var val23 = data2[(alu6+5)];
    var val24 = data2[(alu6+6)];
    var val25 = data2[(alu6+7)];
    var val26 = data2[(alu6+8)];
    var val27 = data2[(alu6+576)];
    var val28 = data2[(alu6+577)];
    var val29 = data2[(alu6+578)];
    var val30 = data2[(alu6+579)];
    var val31 = data2[(alu6+580)];
    var val32 = data2[(alu6+581)];
    var val33 = data2[(alu6+582)];
    var val34 = data2[(alu6+583)];
    var val35 = data2[(alu6+584)];
    var val36 = data2[(alu6+1152)];
    var val37 = data2[(alu6+1153)];
    var val38 = data2[(alu6+1154)];
    var val39 = data2[(alu6+1155)];
    var val40 = data2[(alu6+1156)];
    var val41 = data2[(alu6+1157)];
    var val42 = data2[(alu6+1158)];
    var val43 = data2[(alu6+1159)];
    var val44 = data2[(alu6+1160)];
    var val45 = data2[(alu6+1728)];
    var val46 = data2[(alu6+1729)];
    var val47 = data2[(alu6+1730)];
    var val48 = data2[(alu6+1731)];
    var val49 = data2[(alu6+1732)];
    var val50 = data2[(alu6+1733)];
    var val51 = data2[(alu6+1734)];
    var val52 = data2[(alu6+1735)];
    var val53 = data2[(alu6+1736)];
    acc0 = (acc0+(val2*val0)+(val8*val21)+(val13*val24)+(val3*val19)+(val1*val22)+(val14*val25)+(val4*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val2*val27)+(val8*val30)+(val13*val33)+(val3*val28)+(val1*val31)+(val14*val34)+(val4*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val2*val36)+(val8*val39)+(val13*val42)+(val3*val37)+(val1*val40)+(val14*val43)+(val4*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val2*val45)+(val8*val48)+(val13*val51)+(val3*val46)+(val1*val49)+(val14*val52)+(val4*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val3*val0)+(val1*val21)+(val14*val24)+(val4*val19)+(val9*val22)+(val15*val25)+(val5*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val3*val27)+(val1*val30)+(val14*val33)+(val4*val28)+(val9*val31)+(val15*val34)+(val5*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val3*val36)+(val1*val39)+(val14*val42)+(val4*val37)+(val9*val40)+(val15*val43)+(val5*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val3*val45)+(val1*val48)+(val14*val51)+(val4*val46)+(val9*val49)+(val15*val52)+(val5*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val4*val0)+(val9*val21)+(val15*val24)+(val5*val19)+(val10*val22)+(val16*val25)+(val6*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val4*val27)+(val9*val30)+(val15*val33)+(val5*val28)+(val10*val31)+(val16*val34)+(val6*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val4*val36)+(val9*val39)+(val15*val42)+(val5*val37)+(val10*val40)+(val16*val43)+(val6*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val4*val45)+(val9*val48)+(val15*val51)+(val5*val46)+(val10*val49)+(val16*val52)+(val6*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val5*val0)+(val10*val21)+(val16*val24)+(val6*val19)+(val11*val22)+(val17*val25)+(val7*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val5*val27)+(val10*val30)+(val16*val33)+(val6*val28)+(val11*val31)+(val17*val34)+(val7*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val5*val36)+(val10*val39)+(val16*val42)+(val6*val37)+(val11*val40)+(val17*val43)+(val7*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val5*val45)+(val10*val48)+(val16*val51)+(val6*val46)+(val11*val49)+(val17*val52)+(val7*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val54 = data5[cast1];
  var val55 = data3[cast1];
  var val56 = data4[cast1];
  var val57 = data6[cast1];
  var alu25 = (cast1+1);
  var val58 = data5[alu25];
  var val59 = data3[alu25];
  var val60 = data4[alu25];
  var val61 = data6[alu25];
  var alu26 = (cast1+2);
  var val62 = data5[alu26];
  var val63 = data3[alu26];
  var val64 = data4[alu26];
  var val65 = data6[alu26];
  var alu27 = (cast1+3);
  var val66 = data5[alu27];
  var val67 = data3[alu27];
  var val68 = data4[alu27];
  var val69 = data6[alu27];
  var alu28 = (alu0+(lidx0*10816)+cast0+alu1);
  var cast2 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast5 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu29 = (((acc0-val55)*val56*cast2)+val57);
  data0[alu28] = (alu29*(1/(1.0f+exp2((alu29*-1.4426950408889634f)))));
  var alu31 = (((acc1-val59)*val60*cast3)+val61);
  data0[(alu28+2704)] = (alu31*(1/(1.0f+exp2((alu31*-1.4426950408889634f)))));
  var alu33 = (((acc2-val63)*val64*cast4)+val65);
  data0[(alu28+5408)] = (alu33*(1/(1.0f+exp2((alu33*-1.4426950408889634f)))));
  var alu35 = (((acc3-val67)*val68*cast5)+val69);
  data0[(alu28+8112)] = (alu35*(1/(1.0f+exp2((alu35*-1.4426950408889634f)))));
  var alu37 = (((acc4-val55)*val56*cast2)+val57);
  data0[(alu28+1)] = (alu37*(1/(1.0f+exp2((alu37*-1.4426950408889634f)))));
  var alu39 = (((acc5-val59)*val60*cast3)+val61);
  data0[(alu28+2705)] = (alu39*(1/(1.0f+exp2((alu39*-1.4426950408889634f)))));
  var alu41 = (((acc6-val63)*val64*cast4)+val65);
  data0[(alu28+5409)] = (alu41*(1/(1.0f+exp2((alu41*-1.4426950408889634f)))));
  var alu43 = (((acc7-val67)*val68*cast5)+val69);
  data0[(alu28+8113)] = (alu43*(1/(1.0f+exp2((alu43*-1.4426950408889634f)))));
  var alu45 = (((acc8-val55)*val56*cast2)+val57);
  data0[(alu28+2)] = (alu45*(1/(1.0f+exp2((alu45*-1.4426950408889634f)))));
  var alu47 = (((acc9-val59)*val60*cast3)+val61);
  data0[(alu28+2706)] = (alu47*(1/(1.0f+exp2((alu47*-1.4426950408889634f)))));
  var alu49 = (((acc10-val63)*val64*cast4)+val65);
  data0[(alu28+5410)] = (alu49*(1/(1.0f+exp2((alu49*-1.4426950408889634f)))));
  var alu51 = (((acc11-val67)*val68*cast5)+val69);
  data0[(alu28+8114)] = (alu51*(1/(1.0f+exp2((alu51*-1.4426950408889634f)))));
  var alu53 = (((acc12-val55)*val56*cast2)+val57);
  data0[(alu28+3)] = (alu53*(1/(1.0f+exp2((alu53*-1.4426950408889634f)))));
  var alu55 = (((acc13-val59)*val60*cast3)+val61);
  data0[(alu28+2707)] = (alu55*(1/(1.0f+exp2((alu55*-1.4426950408889634f)))));
  var alu57 = (((acc14-val63)*val64*cast4)+val65);
  data0[(alu28+5411)] = (alu57*(1/(1.0f+exp2((alu57*-1.4426950408889634f)))));
  var alu59 = (((acc15-val67)*val68*cast5)+val69);
  data0[(alu28+8115)] = (alu59*(1/(1.0f+exp2((alu59*-1.4426950408889634f)))));
}`;

const r_5_13_13_4_4_64_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu6 = ((ridx5*9)+(gidx2*9216)+(lidx0*2304));
    var val0 = data2[alu6];
    var alu7 = (cast0+(ridx5*2704)+alu1+alu0);
    var val1 = data1[alu7];
    var val2 = select(0.0f, data1[(alu7+-53)], (alu2&alu3));
    var val3 = select(0.0f, data1[(alu7+-52)], alu2);
    var val4 = select(0.0f, data1[(alu7+-51)], alu2);
    var val5 = select(0.0f, data1[(alu7+-50)], alu2);
    var val6 = select(0.0f, data1[(alu7+-49)], alu2);
    var val7 = select(0.0f, data1[(alu7+-48)], (alu2&alu5));
    var val8 = select(0.0f, data1[(alu7+-1)], alu3);
    var val9 = data1[(alu7+1)];
    var val10 = data1[(alu7+2)];
    var val11 = data1[(alu7+3)];
    var val12 = select(0.0f, data1[(alu7+4)], alu5);
    var val13 = select(0.0f, data1[(alu7+51)], (alu4&alu3));
    var val14 = select(0.0f, data1[(alu7+52)], alu4);
    var val15 = select(0.0f, data1[(alu7+53)], alu4);
    var val16 = select(0.0f, data1[(alu7+54)], alu4);
    var val17 = select(0.0f, data1[(alu7+55)], alu4);
    var val18 = select(0.0f, data1[(alu7+56)], (alu4&alu5));
    var val19 = data2[(alu6+1)];
    var val20 = data2[(alu6+2)];
    var val21 = data2[(alu6+3)];
    var val22 = data2[(alu6+4)];
    var val23 = data2[(alu6+5)];
    var val24 = data2[(alu6+6)];
    var val25 = data2[(alu6+7)];
    var val26 = data2[(alu6+8)];
    var val27 = data2[(alu6+576)];
    var val28 = data2[(alu6+577)];
    var val29 = data2[(alu6+578)];
    var val30 = data2[(alu6+579)];
    var val31 = data2[(alu6+580)];
    var val32 = data2[(alu6+581)];
    var val33 = data2[(alu6+582)];
    var val34 = data2[(alu6+583)];
    var val35 = data2[(alu6+584)];
    var val36 = data2[(alu6+1152)];
    var val37 = data2[(alu6+1153)];
    var val38 = data2[(alu6+1154)];
    var val39 = data2[(alu6+1155)];
    var val40 = data2[(alu6+1156)];
    var val41 = data2[(alu6+1157)];
    var val42 = data2[(alu6+1158)];
    var val43 = data2[(alu6+1159)];
    var val44 = data2[(alu6+1160)];
    var val45 = data2[(alu6+1728)];
    var val46 = data2[(alu6+1729)];
    var val47 = data2[(alu6+1730)];
    var val48 = data2[(alu6+1731)];
    var val49 = data2[(alu6+1732)];
    var val50 = data2[(alu6+1733)];
    var val51 = data2[(alu6+1734)];
    var val52 = data2[(alu6+1735)];
    var val53 = data2[(alu6+1736)];
    acc0 = (acc0+(val2*val0)+(val8*val21)+(val13*val24)+(val3*val19)+(val1*val22)+(val14*val25)+(val4*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val2*val27)+(val8*val30)+(val13*val33)+(val3*val28)+(val1*val31)+(val14*val34)+(val4*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val2*val36)+(val8*val39)+(val13*val42)+(val3*val37)+(val1*val40)+(val14*val43)+(val4*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val2*val45)+(val8*val48)+(val13*val51)+(val3*val46)+(val1*val49)+(val14*val52)+(val4*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val3*val0)+(val1*val21)+(val14*val24)+(val4*val19)+(val9*val22)+(val15*val25)+(val5*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val3*val27)+(val1*val30)+(val14*val33)+(val4*val28)+(val9*val31)+(val15*val34)+(val5*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val3*val36)+(val1*val39)+(val14*val42)+(val4*val37)+(val9*val40)+(val15*val43)+(val5*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val3*val45)+(val1*val48)+(val14*val51)+(val4*val46)+(val9*val49)+(val15*val52)+(val5*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val4*val0)+(val9*val21)+(val15*val24)+(val5*val19)+(val10*val22)+(val16*val25)+(val6*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val4*val27)+(val9*val30)+(val15*val33)+(val5*val28)+(val10*val31)+(val16*val34)+(val6*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val4*val36)+(val9*val39)+(val15*val42)+(val5*val37)+(val10*val40)+(val16*val43)+(val6*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val4*val45)+(val9*val48)+(val15*val51)+(val5*val46)+(val10*val49)+(val16*val52)+(val6*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val5*val0)+(val10*val21)+(val16*val24)+(val6*val19)+(val11*val22)+(val17*val25)+(val7*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val5*val27)+(val10*val30)+(val16*val33)+(val6*val28)+(val11*val31)+(val17*val34)+(val7*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val5*val36)+(val10*val39)+(val16*val42)+(val6*val37)+(val11*val40)+(val17*val43)+(val7*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val5*val45)+(val10*val48)+(val16*val51)+(val6*val46)+(val11*val49)+(val17*val52)+(val7*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = gidx2;
  var precast5 = lidx0;
  var precast6 = (bitcast<u32>(precast4)<<4u);
  var precast7 = (bitcast<u32>(precast5)<<2u);
  var alu25 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val54 = data5[alu25];
  var val55 = data3[alu25];
  var val56 = data4[alu25];
  var val57 = data6[alu25];
  var alu26 = (alu25+1);
  var val58 = data5[alu26];
  var val59 = data3[alu26];
  var val60 = data4[alu26];
  var val61 = data6[alu26];
  var alu27 = (alu25+2);
  var val62 = data5[alu27];
  var val63 = data3[alu27];
  var val64 = data4[alu27];
  var val65 = data6[alu27];
  var alu28 = (alu25+3);
  var val66 = data5[alu28];
  var val67 = data3[alu28];
  var val68 = data4[alu28];
  var val69 = data6[alu28];
  var alu29 = (alu0+(lidx0*10816)+cast0+alu1+(gidx2*43264));
  var cast1 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast2 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu30 = (((acc0-val55)*val56*cast1)+val57);
  data0[alu29] = (alu30*(1/(1.0f+exp2((alu30*-1.4426950408889634f)))));
  var alu32 = (((acc1-val59)*val60*cast2)+val61);
  data0[(alu29+2704)] = (alu32*(1/(1.0f+exp2((alu32*-1.4426950408889634f)))));
  var alu34 = (((acc2-val63)*val64*cast3)+val65);
  data0[(alu29+5408)] = (alu34*(1/(1.0f+exp2((alu34*-1.4426950408889634f)))));
  var alu36 = (((acc3-val67)*val68*cast4)+val69);
  data0[(alu29+8112)] = (alu36*(1/(1.0f+exp2((alu36*-1.4426950408889634f)))));
  var alu38 = (((acc4-val55)*val56*cast1)+val57);
  data0[(alu29+1)] = (alu38*(1/(1.0f+exp2((alu38*-1.4426950408889634f)))));
  var alu40 = (((acc5-val59)*val60*cast2)+val61);
  data0[(alu29+2705)] = (alu40*(1/(1.0f+exp2((alu40*-1.4426950408889634f)))));
  var alu42 = (((acc6-val63)*val64*cast3)+val65);
  data0[(alu29+5409)] = (alu42*(1/(1.0f+exp2((alu42*-1.4426950408889634f)))));
  var alu44 = (((acc7-val67)*val68*cast4)+val69);
  data0[(alu29+8113)] = (alu44*(1/(1.0f+exp2((alu44*-1.4426950408889634f)))));
  var alu46 = (((acc8-val55)*val56*cast1)+val57);
  data0[(alu29+2)] = (alu46*(1/(1.0f+exp2((alu46*-1.4426950408889634f)))));
  var alu48 = (((acc9-val59)*val60*cast2)+val61);
  data0[(alu29+2706)] = (alu48*(1/(1.0f+exp2((alu48*-1.4426950408889634f)))));
  var alu50 = (((acc10-val63)*val64*cast3)+val65);
  data0[(alu29+5410)] = (alu50*(1/(1.0f+exp2((alu50*-1.4426950408889634f)))));
  var alu52 = (((acc11-val67)*val68*cast4)+val69);
  data0[(alu29+8114)] = (alu52*(1/(1.0f+exp2((alu52*-1.4426950408889634f)))));
  var alu54 = (((acc12-val55)*val56*cast1)+val57);
  data0[(alu29+3)] = (alu54*(1/(1.0f+exp2((alu54*-1.4426950408889634f)))));
  var alu56 = (((acc13-val59)*val60*cast2)+val61);
  data0[(alu29+2707)] = (alu56*(1/(1.0f+exp2((alu56*-1.4426950408889634f)))));
  var alu58 = (((acc14-val63)*val64*cast3)+val65);
  data0[(alu29+5411)] = (alu58*(1/(1.0f+exp2((alu58*-1.4426950408889634f)))));
  var alu60 = (((acc15-val67)*val68*cast4)+val69);
  data0[(alu29+8115)] = (alu60*(1/(1.0f+exp2((alu60*-1.4426950408889634f)))));
}`;

const r_13_13_16_2_2_64_4_3_3n4 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx0;
  var cast0 = bitcast<u32>(precast0);
  var alu0 = (((gidx1+lidx1)<1)!=true);
  var alu1 = (((gidx0+lidx2)<1)!=true);
  var precast1 = lidx2;
  var precast2 = (cast0<<2u);
  var precast3 = (bitcast<u32>(precast1)<<1u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 64; ridx5++) {
    var alu2 = ((lidx0*2304)+(ridx5*9));
    var val0 = data2[alu2];
    var alu3 = (bitcast<i32>(precast2)+bitcast<i32>(precast3)+(ridx5*2704)+(gidx1*208)+(lidx1*104));
    var val1 = data1[alu3];
    var val2 = data2[(alu2+1)];
    var val3 = data2[(alu2+2)];
    var val4 = data2[(alu2+3)];
    var val5 = data2[(alu2+4)];
    var val6 = data2[(alu2+5)];
    var val7 = data2[(alu2+6)];
    var val8 = data2[(alu2+7)];
    var val9 = data2[(alu2+8)];
    var val10 = data2[(alu2+576)];
    var val11 = data2[(alu2+577)];
    var val12 = data2[(alu2+578)];
    var val13 = data2[(alu2+579)];
    var val14 = data2[(alu2+580)];
    var val15 = data2[(alu2+581)];
    var val16 = data2[(alu2+582)];
    var val17 = data2[(alu2+583)];
    var val18 = data2[(alu2+584)];
    var val19 = data2[(alu2+1152)];
    var val20 = data2[(alu2+1153)];
    var val21 = data2[(alu2+1154)];
    var val22 = data2[(alu2+1155)];
    var val23 = data2[(alu2+1156)];
    var val24 = data2[(alu2+1157)];
    var val25 = data2[(alu2+1158)];
    var val26 = data2[(alu2+1159)];
    var val27 = data2[(alu2+1160)];
    var val28 = data2[(alu2+1728)];
    var val29 = data2[(alu2+1729)];
    var val30 = data2[(alu2+1730)];
    var val31 = data2[(alu2+1731)];
    var val32 = data2[(alu2+1732)];
    var val33 = data2[(alu2+1733)];
    var val34 = data2[(alu2+1734)];
    var val35 = data2[(alu2+1735)];
    var val36 = data2[(alu2+1736)];
    var val37 = select(0.0f, data1[(alu3+-53)], (alu0&alu1));
    var val38 = select(0.0f, data1[(alu3+-52)], alu0);
    var val39 = select(0.0f, data1[(alu3+-51)], alu0);
    var val40 = select(0.0f, data1[(alu3+-1)], alu1);
    var val41 = data1[(alu3+1)];
    var val42 = select(0.0f, data1[(alu3+51)], alu1);
    var val43 = data1[(alu3+52)];
    var val44 = data1[(alu3+53)];
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data5[cast1];
  var val46 = data3[cast1];
  var val47 = data4[cast1];
  var val48 = data6[cast1];
  var alu9 = (cast1+1);
  var val49 = data5[alu9];
  var val50 = data3[alu9];
  var val51 = data4[alu9];
  var val52 = data6[alu9];
  var alu10 = (cast1+2);
  var val53 = data5[alu10];
  var val54 = data3[alu10];
  var val55 = data4[alu10];
  var val56 = data6[alu10];
  var alu11 = (cast1+3);
  var val57 = data5[alu11];
  var val58 = data3[alu11];
  var val59 = data4[alu11];
  var val60 = data6[alu11];
  var precast6 = (cast0<<1u);
  var alu12 = (lidx2+(lidx1*26)+(lidx0*2704)+bitcast<i32>(precast6)+(gidx1*52));
  var alu13 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu12] = (alu13*(1/(1.0f+exp2((alu13*-1.4426950408889634f)))));
  var alu15 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu12+676)] = (alu15*(1/(1.0f+exp2((alu15*-1.4426950408889634f)))));
  var alu17 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu12+1352)] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
  var alu19 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu12+2028)] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
}`;

const r_5_13_13_4_4_80_4_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1*52);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*208);
  var alu2 = (((gidx1+lidx1)<1)!=true);
  var alu3 = ((gidx0<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var alu4 = ((lidx1+bitcast<i32>(precast3))<51);
  var alu5 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx5 = 0; ridx5 < 80; ridx5++) {
    var alu6 = ((ridx5*9)+(gidx2*11520)+(lidx0*2880));
    var val0 = data2[alu6];
    var alu7 = (cast0+(ridx5*2704)+alu1+alu0);
    var val1 = data1[alu7];
    var val2 = select(0.0f, data1[(alu7+-53)], (alu2&alu3));
    var val3 = select(0.0f, data1[(alu7+-52)], alu2);
    var val4 = select(0.0f, data1[(alu7+-51)], alu2);
    var val5 = select(0.0f, data1[(alu7+-50)], alu2);
    var val6 = select(0.0f, data1[(alu7+-49)], alu2);
    var val7 = select(0.0f, data1[(alu7+-48)], (alu2&alu5));
    var val8 = select(0.0f, data1[(alu7+-1)], alu3);
    var val9 = data1[(alu7+1)];
    var val10 = data1[(alu7+2)];
    var val11 = data1[(alu7+3)];
    var val12 = select(0.0f, data1[(alu7+4)], alu5);
    var val13 = select(0.0f, data1[(alu7+51)], (alu4&alu3));
    var val14 = select(0.0f, data1[(alu7+52)], alu4);
    var val15 = select(0.0f, data1[(alu7+53)], alu4);
    var val16 = select(0.0f, data1[(alu7+54)], alu4);
    var val17 = select(0.0f, data1[(alu7+55)], alu4);
    var val18 = select(0.0f, data1[(alu7+56)], (alu4&alu5));
    var val19 = data2[(alu6+1)];
    var val20 = data2[(alu6+2)];
    var val21 = data2[(alu6+3)];
    var val22 = data2[(alu6+4)];
    var val23 = data2[(alu6+5)];
    var val24 = data2[(alu6+6)];
    var val25 = data2[(alu6+7)];
    var val26 = data2[(alu6+8)];
    var val27 = data2[(alu6+720)];
    var val28 = data2[(alu6+721)];
    var val29 = data2[(alu6+722)];
    var val30 = data2[(alu6+723)];
    var val31 = data2[(alu6+724)];
    var val32 = data2[(alu6+725)];
    var val33 = data2[(alu6+726)];
    var val34 = data2[(alu6+727)];
    var val35 = data2[(alu6+728)];
    var val36 = data2[(alu6+1440)];
    var val37 = data2[(alu6+1441)];
    var val38 = data2[(alu6+1442)];
    var val39 = data2[(alu6+1443)];
    var val40 = data2[(alu6+1444)];
    var val41 = data2[(alu6+1445)];
    var val42 = data2[(alu6+1446)];
    var val43 = data2[(alu6+1447)];
    var val44 = data2[(alu6+1448)];
    var val45 = data2[(alu6+2160)];
    var val46 = data2[(alu6+2161)];
    var val47 = data2[(alu6+2162)];
    var val48 = data2[(alu6+2163)];
    var val49 = data2[(alu6+2164)];
    var val50 = data2[(alu6+2165)];
    var val51 = data2[(alu6+2166)];
    var val52 = data2[(alu6+2167)];
    var val53 = data2[(alu6+2168)];
    acc0 = (acc0+(val2*val0)+(val8*val21)+(val13*val24)+(val3*val19)+(val1*val22)+(val14*val25)+(val4*val20)+(val9*val23)+(val15*val26));
    acc1 = (acc1+(val2*val27)+(val8*val30)+(val13*val33)+(val3*val28)+(val1*val31)+(val14*val34)+(val4*val29)+(val9*val32)+(val15*val35));
    acc2 = (acc2+(val2*val36)+(val8*val39)+(val13*val42)+(val3*val37)+(val1*val40)+(val14*val43)+(val4*val38)+(val9*val41)+(val15*val44));
    acc3 = (acc3+(val2*val45)+(val8*val48)+(val13*val51)+(val3*val46)+(val1*val49)+(val14*val52)+(val4*val47)+(val9*val50)+(val15*val53));
    acc4 = (acc4+(val3*val0)+(val1*val21)+(val14*val24)+(val4*val19)+(val9*val22)+(val15*val25)+(val5*val20)+(val10*val23)+(val16*val26));
    acc5 = (acc5+(val3*val27)+(val1*val30)+(val14*val33)+(val4*val28)+(val9*val31)+(val15*val34)+(val5*val29)+(val10*val32)+(val16*val35));
    acc6 = (acc6+(val3*val36)+(val1*val39)+(val14*val42)+(val4*val37)+(val9*val40)+(val15*val43)+(val5*val38)+(val10*val41)+(val16*val44));
    acc7 = (acc7+(val3*val45)+(val1*val48)+(val14*val51)+(val4*val46)+(val9*val49)+(val15*val52)+(val5*val47)+(val10*val50)+(val16*val53));
    acc8 = (acc8+(val4*val0)+(val9*val21)+(val15*val24)+(val5*val19)+(val10*val22)+(val16*val25)+(val6*val20)+(val11*val23)+(val17*val26));
    acc9 = (acc9+(val4*val27)+(val9*val30)+(val15*val33)+(val5*val28)+(val10*val31)+(val16*val34)+(val6*val29)+(val11*val32)+(val17*val35));
    acc10 = (acc10+(val4*val36)+(val9*val39)+(val15*val42)+(val5*val37)+(val10*val40)+(val16*val43)+(val6*val38)+(val11*val41)+(val17*val44));
    acc11 = (acc11+(val4*val45)+(val9*val48)+(val15*val51)+(val5*val46)+(val10*val49)+(val16*val52)+(val6*val47)+(val11*val50)+(val17*val53));
    acc12 = (acc12+(val5*val0)+(val10*val21)+(val16*val24)+(val6*val19)+(val11*val22)+(val17*val25)+(val7*val20)+(val12*val23)+(val18*val26));
    acc13 = (acc13+(val5*val27)+(val10*val30)+(val16*val33)+(val6*val28)+(val11*val31)+(val17*val34)+(val7*val29)+(val12*val32)+(val18*val35));
    acc14 = (acc14+(val5*val36)+(val10*val39)+(val16*val42)+(val6*val37)+(val11*val40)+(val17*val43)+(val7*val38)+(val12*val41)+(val18*val44));
    acc15 = (acc15+(val5*val45)+(val10*val48)+(val16*val51)+(val6*val46)+(val11*val49)+(val17*val52)+(val7*val47)+(val12*val50)+(val18*val53));
  }
  var precast4 = gidx2;
  var precast5 = lidx0;
  var precast6 = (bitcast<u32>(precast4)<<4u);
  var precast7 = (bitcast<u32>(precast5)<<2u);
  var alu25 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val54 = data5[alu25];
  var val55 = data3[alu25];
  var val56 = data4[alu25];
  var val57 = data6[alu25];
  var alu26 = (alu25+1);
  var val58 = data5[alu26];
  var val59 = data3[alu26];
  var val60 = data4[alu26];
  var val61 = data6[alu26];
  var alu27 = (alu25+2);
  var val62 = data5[alu27];
  var val63 = data3[alu27];
  var val64 = data4[alu27];
  var val65 = data6[alu27];
  var alu28 = (alu25+3);
  var val66 = data5[alu28];
  var val67 = data3[alu28];
  var val68 = data4[alu28];
  var val69 = data6[alu28];
  var alu29 = (alu0+(lidx0*10816)+cast0+alu1+(gidx2*43264));
  var cast1 = (f32((1/sqrt((val54+(f16(0.001f)))))));
  var cast2 = (f32((1/sqrt((val58+(f16(0.001f)))))));
  var cast3 = (f32((1/sqrt((val62+(f16(0.001f)))))));
  var cast4 = (f32((1/sqrt((val66+(f16(0.001f)))))));
  var alu30 = (((acc0-val55)*val56*cast1)+val57);
  data0[alu29] = (alu30*(1/(1.0f+exp2((alu30*-1.4426950408889634f)))));
  var alu32 = (((acc1-val59)*val60*cast2)+val61);
  data0[(alu29+2704)] = (alu32*(1/(1.0f+exp2((alu32*-1.4426950408889634f)))));
  var alu34 = (((acc2-val63)*val64*cast3)+val65);
  data0[(alu29+5408)] = (alu34*(1/(1.0f+exp2((alu34*-1.4426950408889634f)))));
  var alu36 = (((acc3-val67)*val68*cast4)+val69);
  data0[(alu29+8112)] = (alu36*(1/(1.0f+exp2((alu36*-1.4426950408889634f)))));
  var alu38 = (((acc4-val55)*val56*cast1)+val57);
  data0[(alu29+1)] = (alu38*(1/(1.0f+exp2((alu38*-1.4426950408889634f)))));
  var alu40 = (((acc5-val59)*val60*cast2)+val61);
  data0[(alu29+2705)] = (alu40*(1/(1.0f+exp2((alu40*-1.4426950408889634f)))));
  var alu42 = (((acc6-val63)*val64*cast3)+val65);
  data0[(alu29+5409)] = (alu42*(1/(1.0f+exp2((alu42*-1.4426950408889634f)))));
  var alu44 = (((acc7-val67)*val68*cast4)+val69);
  data0[(alu29+8113)] = (alu44*(1/(1.0f+exp2((alu44*-1.4426950408889634f)))));
  var alu46 = (((acc8-val55)*val56*cast1)+val57);
  data0[(alu29+2)] = (alu46*(1/(1.0f+exp2((alu46*-1.4426950408889634f)))));
  var alu48 = (((acc9-val59)*val60*cast2)+val61);
  data0[(alu29+2706)] = (alu48*(1/(1.0f+exp2((alu48*-1.4426950408889634f)))));
  var alu50 = (((acc10-val63)*val64*cast3)+val65);
  data0[(alu29+5410)] = (alu50*(1/(1.0f+exp2((alu50*-1.4426950408889634f)))));
  var alu52 = (((acc11-val67)*val68*cast4)+val69);
  data0[(alu29+8114)] = (alu52*(1/(1.0f+exp2((alu52*-1.4426950408889634f)))));
  var alu54 = (((acc12-val55)*val56*cast1)+val57);
  data0[(alu29+3)] = (alu54*(1/(1.0f+exp2((alu54*-1.4426950408889634f)))));
  var alu56 = (((acc13-val59)*val60*cast2)+val61);
  data0[(alu29+2707)] = (alu56*(1/(1.0f+exp2((alu56*-1.4426950408889634f)))));
  var alu58 = (((acc14-val63)*val64*cast3)+val65);
  data0[(alu29+5411)] = (alu58*(1/(1.0f+exp2((alu58*-1.4426950408889634f)))));
  var alu60 = (((acc15-val67)*val68*cast4)+val69);
  data0[(alu29+8115)] = (alu60*(1/(1.0f+exp2((alu60*-1.4426950408889634f)))));
}`;

const E_6_169_32_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 6 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var alu0 = ((lidx0*676)+bitcast<i32>(precast1)+(gidx1*21632));
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var alu3 = (alu0+3);
  var alu4 = (gidx1<2);
  var val0 = select(0.0f, data1[alu0], alu4);
  var val1 = select(0.0f, data1[alu1], alu4);
  var val2 = select(0.0f, data1[alu2], alu4);
  var val3 = select(0.0f, data1[alu3], alu4);
  var alu5 = (alu4!=true);
  var val4 = select(0.0f, data2[(alu0+-43264)], alu5);
  var val5 = select(0.0f, data2[(alu0+-43263)], alu5);
  var val6 = select(0.0f, data2[(alu0+-43262)], alu5);
  var val7 = select(0.0f, data2[(alu0+-43261)], alu5);
  data0[alu0] = (val0+val4);
  data0[alu1] = (val1+val5);
  data0[alu2] = (val2+val6);
  data0[alu3] = (val3+val7);
}`;

const r_169_16_4_16_4_4_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  var cast1 = bitcast<i32>(precast3);
  var precast4 = lidx0;
  var cast2 = bitcast<u32>(precast4);
  var precast5 = (cast2<<8u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 16; ridx3++) {
    var precast6 = ridx3;
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu0 = (bitcast<i32>(precast5)+bitcast<i32>(precast7));
    var val0 = data2[alu0];
    var alu1 = ((ridx3*10816)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+64)];
    var val6 = data2[(alu0+65)];
    var val7 = data2[(alu0+66)];
    var val8 = data2[(alu0+67)];
    var val9 = data2[(alu0+128)];
    var val10 = data2[(alu0+129)];
    var val11 = data2[(alu0+130)];
    var val12 = data2[(alu0+131)];
    var val13 = data2[(alu0+192)];
    var val14 = data2[(alu0+193)];
    var val15 = data2[(alu0+194)];
    var val16 = data2[(alu0+195)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+2704)];
    var val21 = data1[(alu1+2705)];
    var val22 = data1[(alu1+2706)];
    var val23 = data1[(alu1+2707)];
    var val24 = data1[(alu1+5408)];
    var val25 = data1[(alu1+5409)];
    var val26 = data1[(alu1+5410)];
    var val27 = data1[(alu1+5411)];
    var val28 = data1[(alu1+8112)];
    var val29 = data1[(alu1+8113)];
    var val30 = data1[(alu1+8114)];
    var val31 = data1[(alu1+8115)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast8 = (cast2<<2u);
  var cast3 = bitcast<i32>(precast8);
  var val32 = data3[cast3];
  var val33 = data3[(cast3+1)];
  var val34 = data3[(cast3+2)];
  var val35 = data3[(cast3+3)];
  var alu19 = (cast0+cast1+(lidx0*10816));
  data0[alu19] = (acc0+val32);
  data0[(alu19+2704)] = (acc1+val33);
  data0[(alu19+5408)] = (acc2+val34);
  data0[(alu19+8112)] = (acc3+val35);
  data0[(alu19+1)] = (acc4+val32);
  data0[(alu19+2705)] = (acc5+val33);
  data0[(alu19+5409)] = (acc6+val34);
  data0[(alu19+8113)] = (acc7+val35);
  data0[(alu19+2)] = (acc8+val32);
  data0[(alu19+2706)] = (acc9+val33);
  data0[(alu19+5410)] = (acc10+val34);
  data0[(alu19+8114)] = (acc11+val35);
  data0[(alu19+3)] = (acc12+val32);
  data0[(alu19+2707)] = (acc13+val33);
  data0[(alu19+5411)] = (acc14+val34);
  data0[(alu19+8115)] = (acc15+val35);
}`;

const r_5_169_4_4_20_4_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  var cast1 = bitcast<i32>(precast3);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 20; ridx4++) {
    var precast4 = ridx4;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = (bitcast<i32>(precast5)+(gidx1*1280)+(lidx0*320));
    var val0 = data2[alu0];
    var alu1 = ((ridx4*10816)+cast1+cast0);
    var val1 = data1[alu1];
    var val2 = data2[(alu0+1)];
    var val3 = data2[(alu0+2)];
    var val4 = data2[(alu0+3)];
    var val5 = data2[(alu0+80)];
    var val6 = data2[(alu0+81)];
    var val7 = data2[(alu0+82)];
    var val8 = data2[(alu0+83)];
    var val9 = data2[(alu0+160)];
    var val10 = data2[(alu0+161)];
    var val11 = data2[(alu0+162)];
    var val12 = data2[(alu0+163)];
    var val13 = data2[(alu0+240)];
    var val14 = data2[(alu0+241)];
    var val15 = data2[(alu0+242)];
    var val16 = data2[(alu0+243)];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+2704)];
    var val21 = data1[(alu1+2705)];
    var val22 = data1[(alu1+2706)];
    var val23 = data1[(alu1+2707)];
    var val24 = data1[(alu1+5408)];
    var val25 = data1[(alu1+5409)];
    var val26 = data1[(alu1+5410)];
    var val27 = data1[(alu1+5411)];
    var val28 = data1[(alu1+8112)];
    var val29 = data1[(alu1+8113)];
    var val30 = data1[(alu1+8114)];
    var val31 = data1[(alu1+8115)];
    acc0 = (acc0+(val1*val0)+(val20*val2)+(val24*val3)+(val28*val4));
    acc1 = (acc1+(val1*val5)+(val20*val6)+(val24*val7)+(val28*val8));
    acc2 = (acc2+(val1*val9)+(val20*val10)+(val24*val11)+(val28*val12));
    acc3 = (acc3+(val1*val13)+(val20*val14)+(val24*val15)+(val28*val16));
    acc4 = (acc4+(val17*val0)+(val21*val2)+(val25*val3)+(val29*val4));
    acc5 = (acc5+(val17*val5)+(val21*val6)+(val25*val7)+(val29*val8));
    acc6 = (acc6+(val17*val9)+(val21*val10)+(val25*val11)+(val29*val12));
    acc7 = (acc7+(val17*val13)+(val21*val14)+(val25*val15)+(val29*val16));
    acc8 = (acc8+(val18*val0)+(val22*val2)+(val26*val3)+(val30*val4));
    acc9 = (acc9+(val18*val5)+(val22*val6)+(val26*val7)+(val30*val8));
    acc10 = (acc10+(val18*val9)+(val22*val10)+(val26*val11)+(val30*val12));
    acc11 = (acc11+(val18*val13)+(val22*val14)+(val26*val15)+(val30*val16));
    acc12 = (acc12+(val19*val0)+(val23*val2)+(val27*val3)+(val31*val4));
    acc13 = (acc13+(val19*val5)+(val23*val6)+(val27*val7)+(val31*val8));
    acc14 = (acc14+(val19*val9)+(val23*val10)+(val27*val11)+(val31*val12));
    acc15 = (acc15+(val19*val13)+(val23*val14)+(val27*val15)+(val31*val16));
  }
  var precast6 = gidx1;
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast6)<<4u);
  var precast9 = (bitcast<u32>(precast7)<<2u);
  var alu19 = (bitcast<i32>(precast8)+bitcast<i32>(precast9));
  var val32 = data3[alu19];
  var val33 = data3[(alu19+1)];
  var val34 = data3[(alu19+2)];
  var val35 = data3[(alu19+3)];
  var alu20 = (cast0+(lidx0*10816)+cast1+(gidx1*43264));
  data0[alu20] = (acc0+val32);
  data0[(alu20+2704)] = (acc1+val33);
  data0[(alu20+5408)] = (acc2+val34);
  data0[(alu20+8112)] = (acc3+val35);
  data0[(alu20+1)] = (acc4+val32);
  data0[(alu20+2705)] = (acc5+val33);
  data0[(alu20+5409)] = (acc6+val34);
  data0[(alu20+8113)] = (acc7+val35);
  data0[(alu20+2)] = (acc8+val32);
  data0[(alu20+2706)] = (acc9+val33);
  data0[(alu20+5410)] = (acc10+val34);
  data0[(alu20+8114)] = (acc11+val35);
  data0[(alu20+3)] = (acc12+val32);
  data0[(alu20+2707)] = (acc13+val33);
  data0[(alu20+5411)] = (acc14+val34);
  data0[(alu20+8115)] = (acc15+val35);
}`;

const r_13_13_16_2_2_128_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx5 = 0; ridx5 < 128; ridx5++) {
    var alu7 = ((lidx0*4608)+(ridx5*9));
    var val0 = data2[alu7];
    var alu8 = (alu2+(ridx5*676)+alu1+alu0);
    var val1 = data1[alu8];
    var val2 = data2[(alu7+1)];
    var val3 = data2[(alu7+2)];
    var val4 = data2[(alu7+3)];
    var val5 = data2[(alu7+4)];
    var val6 = data2[(alu7+5)];
    var val7 = data2[(alu7+6)];
    var val8 = data2[(alu7+7)];
    var val9 = data2[(alu7+8)];
    var val10 = data2[(alu7+1152)];
    var val11 = data2[(alu7+1153)];
    var val12 = data2[(alu7+1154)];
    var val13 = data2[(alu7+1155)];
    var val14 = data2[(alu7+1156)];
    var val15 = data2[(alu7+1157)];
    var val16 = data2[(alu7+1158)];
    var val17 = data2[(alu7+1159)];
    var val18 = data2[(alu7+1160)];
    var val19 = data2[(alu7+2304)];
    var val20 = data2[(alu7+2305)];
    var val21 = data2[(alu7+2306)];
    var val22 = data2[(alu7+2307)];
    var val23 = data2[(alu7+2308)];
    var val24 = data2[(alu7+2309)];
    var val25 = data2[(alu7+2310)];
    var val26 = data2[(alu7+2311)];
    var val27 = data2[(alu7+2312)];
    var val28 = data2[(alu7+3456)];
    var val29 = data2[(alu7+3457)];
    var val30 = data2[(alu7+3458)];
    var val31 = data2[(alu7+3459)];
    var val32 = data2[(alu7+3460)];
    var val33 = data2[(alu7+3461)];
    var val34 = data2[(alu7+3462)];
    var val35 = data2[(alu7+3463)];
    var val36 = data2[(alu7+3464)];
    var val37 = select(0.0f, data1[(alu8+-27)], (alu3&alu4));
    var val38 = select(0.0f, data1[(alu8+-26)], alu3);
    var val39 = select(0.0f, data1[(alu8+-25)], (alu3&alu6));
    var val40 = select(0.0f, data1[(alu8+-1)], alu4);
    var val41 = select(0.0f, data1[(alu8+1)], alu6);
    var val42 = select(0.0f, data1[(alu8+25)], (alu5&alu4));
    var val43 = select(0.0f, data1[(alu8+26)], alu5);
    var val44 = select(0.0f, data1[(alu8+27)], (alu5&alu6));
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = lidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var cast1 = bitcast<i32>(precast5);
  var val45 = data5[cast1];
  var val46 = data3[cast1];
  var val47 = data4[cast1];
  var val48 = data6[cast1];
  var alu14 = (cast1+1);
  var val49 = data5[alu14];
  var val50 = data3[alu14];
  var val51 = data4[alu14];
  var val52 = data6[alu14];
  var alu15 = (cast1+2);
  var val53 = data5[alu15];
  var val54 = data3[alu15];
  var val55 = data4[alu15];
  var val56 = data6[alu15];
  var alu16 = (cast1+3);
  var val57 = data5[alu16];
  var val58 = data3[alu16];
  var val59 = data4[alu16];
  var val60 = data6[alu16];
  var alu17 = (lidx2+alu0+(lidx0*2704)+cast0+alu1);
  var alu18 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu17] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu17+676)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu17+1352)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
  var alu24 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu17+2028)] = (alu24*(1/(1.0f+exp2((alu24*-1.4426950408889634f)))));
}`;

const r_5_13_13_4_2_2_128_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx6 = 0; ridx6 < 128; ridx6++) {
    var alu7 = ((ridx6*9)+(gidx2*18432)+(lidx0*4608));
    var val0 = data2[alu7];
    var alu8 = (alu2+(ridx6*676)+alu1+alu0);
    var val1 = data1[alu8];
    var val2 = data2[(alu7+1)];
    var val3 = data2[(alu7+2)];
    var val4 = data2[(alu7+3)];
    var val5 = data2[(alu7+4)];
    var val6 = data2[(alu7+5)];
    var val7 = data2[(alu7+6)];
    var val8 = data2[(alu7+7)];
    var val9 = data2[(alu7+8)];
    var val10 = data2[(alu7+1152)];
    var val11 = data2[(alu7+1153)];
    var val12 = data2[(alu7+1154)];
    var val13 = data2[(alu7+1155)];
    var val14 = data2[(alu7+1156)];
    var val15 = data2[(alu7+1157)];
    var val16 = data2[(alu7+1158)];
    var val17 = data2[(alu7+1159)];
    var val18 = data2[(alu7+1160)];
    var val19 = data2[(alu7+2304)];
    var val20 = data2[(alu7+2305)];
    var val21 = data2[(alu7+2306)];
    var val22 = data2[(alu7+2307)];
    var val23 = data2[(alu7+2308)];
    var val24 = data2[(alu7+2309)];
    var val25 = data2[(alu7+2310)];
    var val26 = data2[(alu7+2311)];
    var val27 = data2[(alu7+2312)];
    var val28 = data2[(alu7+3456)];
    var val29 = data2[(alu7+3457)];
    var val30 = data2[(alu7+3458)];
    var val31 = data2[(alu7+3459)];
    var val32 = data2[(alu7+3460)];
    var val33 = data2[(alu7+3461)];
    var val34 = data2[(alu7+3462)];
    var val35 = data2[(alu7+3463)];
    var val36 = data2[(alu7+3464)];
    var val37 = select(0.0f, data1[(alu8+-27)], (alu3&alu4));
    var val38 = select(0.0f, data1[(alu8+-26)], alu3);
    var val39 = select(0.0f, data1[(alu8+-25)], (alu3&alu6));
    var val40 = select(0.0f, data1[(alu8+-1)], alu4);
    var val41 = select(0.0f, data1[(alu8+1)], alu6);
    var val42 = select(0.0f, data1[(alu8+25)], (alu5&alu4));
    var val43 = select(0.0f, data1[(alu8+26)], alu5);
    var val44 = select(0.0f, data1[(alu8+27)], (alu5&alu6));
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = gidx2;
  var precast5 = lidx0;
  var precast6 = (bitcast<u32>(precast4)<<4u);
  var precast7 = (bitcast<u32>(precast5)<<2u);
  var alu14 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val45 = data5[alu14];
  var val46 = data3[alu14];
  var val47 = data4[alu14];
  var val48 = data6[alu14];
  var alu15 = (alu14+1);
  var val49 = data5[alu15];
  var val50 = data3[alu15];
  var val51 = data4[alu15];
  var val52 = data6[alu15];
  var alu16 = (alu14+2);
  var val53 = data5[alu16];
  var val54 = data3[alu16];
  var val55 = data4[alu16];
  var val56 = data6[alu16];
  var alu17 = (alu14+3);
  var val57 = data5[alu17];
  var val58 = data3[alu17];
  var val59 = data4[alu17];
  var val60 = data6[alu17];
  var alu18 = (lidx2+alu0+(lidx0*2704)+cast0+alu1+(gidx2*10816));
  var alu19 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu18] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
  var alu21 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu18+676)] = (alu21*(1/(1.0f+exp2((alu21*-1.4426950408889634f)))));
  var alu23 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu18+1352)] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu18+2028)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
}`;

const r_13_13_32_128_4_3_3n2 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx1<1)!=true);
  var alu1 = ((gidx0<1)!=true);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 128; ridx3++) {
    var alu2 = (bitcast<i32>(precast1)+(gidx1*52)+(ridx3*676));
    var val0 = data1[alu2];
    var alu3 = ((lidx0*4608)+(ridx3*9));
    var val1 = data2[alu3];
    var val2 = select(0.0f, data1[(alu2+-27)], (alu0&alu1));
    var val3 = select(0.0f, data1[(alu2+-26)], alu0);
    var val4 = select(0.0f, data1[(alu2+-25)], alu0);
    var val5 = select(0.0f, data1[(alu2+-1)], alu1);
    var val6 = data1[(alu2+1)];
    var val7 = select(0.0f, data1[(alu2+25)], alu1);
    var val8 = data1[(alu2+26)];
    var val9 = data1[(alu2+27)];
    var val10 = data2[(alu3+1)];
    var val11 = data2[(alu3+2)];
    var val12 = data2[(alu3+3)];
    var val13 = data2[(alu3+4)];
    var val14 = data2[(alu3+5)];
    var val15 = data2[(alu3+6)];
    var val16 = data2[(alu3+7)];
    var val17 = data2[(alu3+8)];
    var val18 = data2[(alu3+1152)];
    var val19 = data2[(alu3+1153)];
    var val20 = data2[(alu3+1154)];
    var val21 = data2[(alu3+1155)];
    var val22 = data2[(alu3+1156)];
    var val23 = data2[(alu3+1157)];
    var val24 = data2[(alu3+1158)];
    var val25 = data2[(alu3+1159)];
    var val26 = data2[(alu3+1160)];
    var val27 = data2[(alu3+2304)];
    var val28 = data2[(alu3+2305)];
    var val29 = data2[(alu3+2306)];
    var val30 = data2[(alu3+2307)];
    var val31 = data2[(alu3+2308)];
    var val32 = data2[(alu3+2309)];
    var val33 = data2[(alu3+2310)];
    var val34 = data2[(alu3+2311)];
    var val35 = data2[(alu3+2312)];
    var val36 = data2[(alu3+3456)];
    var val37 = data2[(alu3+3457)];
    var val38 = data2[(alu3+3458)];
    var val39 = data2[(alu3+3459)];
    var val40 = data2[(alu3+3460)];
    var val41 = data2[(alu3+3461)];
    var val42 = data2[(alu3+3462)];
    var val43 = data2[(alu3+3463)];
    var val44 = data2[(alu3+3464)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast2)<<2u);
  var cast0 = bitcast<i32>(precast3);
  var val45 = data5[cast0];
  var val46 = data3[cast0];
  var val47 = data4[cast0];
  var val48 = data6[cast0];
  var alu9 = (cast0+1);
  var val49 = data5[alu9];
  var val50 = data3[alu9];
  var val51 = data4[alu9];
  var val52 = data6[alu9];
  var alu10 = (cast0+2);
  var val53 = data5[alu10];
  var val54 = data3[alu10];
  var val55 = data4[alu10];
  var val56 = data6[alu10];
  var alu11 = (cast0+3);
  var val57 = data5[alu11];
  var val58 = data3[alu11];
  var val59 = data4[alu11];
  var val60 = data6[alu11];
  var alu12 = ((lidx0*676)+gidx0+(gidx1*13));
  var alu13 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu12] = (alu13*(1/(1.0f+exp2((alu13*-1.4426950408889634f)))));
  var alu15 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu12+169)] = (alu15*(1/(1.0f+exp2((alu15*-1.4426950408889634f)))));
  var alu17 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu12+338)] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
  var alu19 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu12+507)] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
}`;

const r_5_13_13_4_2_2_80_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx1*26);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var cast0 = bitcast<i32>(precast1);
  var alu1 = (gidx1*52);
  var alu2 = (lidx2+cast0);
  var alu3 = (((gidx1+lidx1)<1)!=true);
  var alu4 = (((gidx0+lidx2)<1)!=true);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<1u);
  var alu5 = ((lidx1+bitcast<i32>(precast3))<25);
  var alu6 = (alu2<25);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx6 = 0; ridx6 < 80; ridx6++) {
    var alu7 = ((ridx6*9)+(gidx2*11520)+(lidx0*2880));
    var val0 = data2[alu7];
    var alu8 = (alu2+(ridx6*676)+alu1+alu0);
    var val1 = data1[alu8];
    var val2 = data2[(alu7+1)];
    var val3 = data2[(alu7+2)];
    var val4 = data2[(alu7+3)];
    var val5 = data2[(alu7+4)];
    var val6 = data2[(alu7+5)];
    var val7 = data2[(alu7+6)];
    var val8 = data2[(alu7+7)];
    var val9 = data2[(alu7+8)];
    var val10 = data2[(alu7+720)];
    var val11 = data2[(alu7+721)];
    var val12 = data2[(alu7+722)];
    var val13 = data2[(alu7+723)];
    var val14 = data2[(alu7+724)];
    var val15 = data2[(alu7+725)];
    var val16 = data2[(alu7+726)];
    var val17 = data2[(alu7+727)];
    var val18 = data2[(alu7+728)];
    var val19 = data2[(alu7+1440)];
    var val20 = data2[(alu7+1441)];
    var val21 = data2[(alu7+1442)];
    var val22 = data2[(alu7+1443)];
    var val23 = data2[(alu7+1444)];
    var val24 = data2[(alu7+1445)];
    var val25 = data2[(alu7+1446)];
    var val26 = data2[(alu7+1447)];
    var val27 = data2[(alu7+1448)];
    var val28 = data2[(alu7+2160)];
    var val29 = data2[(alu7+2161)];
    var val30 = data2[(alu7+2162)];
    var val31 = data2[(alu7+2163)];
    var val32 = data2[(alu7+2164)];
    var val33 = data2[(alu7+2165)];
    var val34 = data2[(alu7+2166)];
    var val35 = data2[(alu7+2167)];
    var val36 = data2[(alu7+2168)];
    var val37 = select(0.0f, data1[(alu8+-27)], (alu3&alu4));
    var val38 = select(0.0f, data1[(alu8+-26)], alu3);
    var val39 = select(0.0f, data1[(alu8+-25)], (alu3&alu6));
    var val40 = select(0.0f, data1[(alu8+-1)], alu4);
    var val41 = select(0.0f, data1[(alu8+1)], alu6);
    var val42 = select(0.0f, data1[(alu8+25)], (alu5&alu4));
    var val43 = select(0.0f, data1[(alu8+26)], alu5);
    var val44 = select(0.0f, data1[(alu8+27)], (alu5&alu6));
    acc0 = (acc0+(val37*val0)+(val40*val4)+(val42*val7)+(val38*val2)+(val1*val5)+(val43*val8)+(val39*val3)+(val41*val6)+(val44*val9));
    acc1 = (acc1+(val37*val10)+(val40*val13)+(val42*val16)+(val38*val11)+(val1*val14)+(val43*val17)+(val39*val12)+(val41*val15)+(val44*val18));
    acc2 = (acc2+(val37*val19)+(val40*val22)+(val42*val25)+(val38*val20)+(val1*val23)+(val43*val26)+(val39*val21)+(val41*val24)+(val44*val27));
    acc3 = (acc3+(val37*val28)+(val40*val31)+(val42*val34)+(val38*val29)+(val1*val32)+(val43*val35)+(val39*val30)+(val41*val33)+(val44*val36));
  }
  var precast4 = gidx2;
  var precast5 = lidx0;
  var precast6 = (bitcast<u32>(precast4)<<4u);
  var precast7 = (bitcast<u32>(precast5)<<2u);
  var alu14 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val45 = data5[alu14];
  var val46 = data3[alu14];
  var val47 = data4[alu14];
  var val48 = data6[alu14];
  var alu15 = (alu14+1);
  var val49 = data5[alu15];
  var val50 = data3[alu15];
  var val51 = data4[alu15];
  var val52 = data6[alu15];
  var alu16 = (alu14+2);
  var val53 = data5[alu16];
  var val54 = data3[alu16];
  var val55 = data4[alu16];
  var val56 = data6[alu16];
  var alu17 = (alu14+3);
  var val57 = data5[alu17];
  var val58 = data3[alu17];
  var val59 = data4[alu17];
  var val60 = data6[alu17];
  var alu18 = (lidx2+alu0+(lidx0*2704)+cast0+alu1+(gidx2*10816));
  var alu19 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu18] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
  var alu21 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu18+676)] = (alu21*(1/(1.0f+exp2((alu21*-1.4426950408889634f)))));
  var alu23 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu18+1352)] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
  var alu25 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu18+2028)] = (alu25*(1/(1.0f+exp2((alu25*-1.4426950408889634f)))));
}`;

const E_12_169_32n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 12 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((lidx0*169)+gidx0+(gidx1*5408));
  var alu1 = (gidx1<4);
  var val0 = select(0.0f, data1[alu0], alu1);
  var val1 = select(0.0f, data2[(alu0+-21632)], (alu1!=true));
  data0[alu0] = (val0+val1);
}`;

const r_169_16_16_4_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = lidx0;
  var cast1 = bitcast<u32>(precast2);
  var precast3 = (cast1<<8u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx2 = 0; ridx2 < 16; ridx2++) {
    var precast4 = ridx2;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = (cast0+(ridx2*2704));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast3)+bitcast<i32>(precast5));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+1)];
    var val3 = data1[(alu0+2)];
    var val4 = data1[(alu0+3)];
    var val5 = data1[(alu0+676)];
    var val6 = data1[(alu0+677)];
    var val7 = data1[(alu0+678)];
    var val8 = data1[(alu0+679)];
    var val9 = data1[(alu0+1352)];
    var val10 = data1[(alu0+1353)];
    var val11 = data1[(alu0+1354)];
    var val12 = data1[(alu0+1355)];
    var val13 = data1[(alu0+2028)];
    var val14 = data1[(alu0+2029)];
    var val15 = data1[(alu0+2030)];
    var val16 = data1[(alu0+2031)];
    var val17 = data2[(alu1+1)];
    var val18 = data2[(alu1+2)];
    var val19 = data2[(alu1+3)];
    var val20 = data2[(alu1+64)];
    var val21 = data2[(alu1+65)];
    var val22 = data2[(alu1+66)];
    var val23 = data2[(alu1+67)];
    var val24 = data2[(alu1+128)];
    var val25 = data2[(alu1+129)];
    var val26 = data2[(alu1+130)];
    var val27 = data2[(alu1+131)];
    var val28 = data2[(alu1+192)];
    var val29 = data2[(alu1+193)];
    var val30 = data2[(alu1+194)];
    var val31 = data2[(alu1+195)];
    acc0 = (acc0+(val0*val1)+(val5*val17)+(val9*val18)+(val13*val19));
    acc1 = (acc1+(val0*val20)+(val5*val21)+(val9*val22)+(val13*val23));
    acc2 = (acc2+(val0*val24)+(val5*val25)+(val9*val26)+(val13*val27));
    acc3 = (acc3+(val0*val28)+(val5*val29)+(val9*val30)+(val13*val31));
    acc4 = (acc4+(val2*val1)+(val6*val17)+(val10*val18)+(val14*val19));
    acc5 = (acc5+(val2*val20)+(val6*val21)+(val10*val22)+(val14*val23));
    acc6 = (acc6+(val2*val24)+(val6*val25)+(val10*val26)+(val14*val27));
    acc7 = (acc7+(val2*val28)+(val6*val29)+(val10*val30)+(val14*val31));
    acc8 = (acc8+(val3*val1)+(val7*val17)+(val11*val18)+(val15*val19));
    acc9 = (acc9+(val3*val20)+(val7*val21)+(val11*val22)+(val15*val23));
    acc10 = (acc10+(val3*val24)+(val7*val25)+(val11*val26)+(val15*val27));
    acc11 = (acc11+(val3*val28)+(val7*val29)+(val11*val30)+(val15*val31));
    acc12 = (acc12+(val4*val1)+(val8*val17)+(val12*val18)+(val16*val19));
    acc13 = (acc13+(val4*val20)+(val8*val21)+(val12*val22)+(val16*val23));
    acc14 = (acc14+(val4*val24)+(val8*val25)+(val12*val26)+(val16*val27));
    acc15 = (acc15+(val4*val28)+(val8*val29)+(val12*val30)+(val16*val31));
  }
  var precast6 = (cast1<<2u);
  var cast2 = bitcast<i32>(precast6);
  var val32 = data3[cast2];
  var val33 = data3[(cast2+1)];
  var val34 = data3[(cast2+2)];
  var val35 = data3[(cast2+3)];
  var alu19 = (cast0+(lidx0*2704));
  data0[alu19] = (acc0+val32);
  data0[(alu19+676)] = (acc1+val33);
  data0[(alu19+1352)] = (acc2+val34);
  data0[(alu19+2028)] = (acc3+val35);
  data0[(alu19+1)] = (acc4+val32);
  data0[(alu19+677)] = (acc5+val33);
  data0[(alu19+1353)] = (acc6+val34);
  data0[(alu19+2029)] = (acc7+val35);
  data0[(alu19+2)] = (acc8+val32);
  data0[(alu19+678)] = (acc9+val33);
  data0[(alu19+1354)] = (acc10+val34);
  data0[(alu19+2030)] = (acc11+val35);
  data0[(alu19+3)] = (acc12+val32);
  data0[(alu19+679)] = (acc13+val33);
  data0[(alu19+1355)] = (acc14+val34);
  data0[(alu19+2031)] = (acc15+val35);
}`;

const r_5_169_4_20_4_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx3 = 0; ridx3 < 20; ridx3++) {
    var precast2 = ridx3;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu0 = (cast0+(ridx3*2704));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast3)+(gidx1*1280)+(lidx0*320));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+1)];
    var val3 = data1[(alu0+2)];
    var val4 = data1[(alu0+3)];
    var val5 = data1[(alu0+676)];
    var val6 = data1[(alu0+677)];
    var val7 = data1[(alu0+678)];
    var val8 = data1[(alu0+679)];
    var val9 = data1[(alu0+1352)];
    var val10 = data1[(alu0+1353)];
    var val11 = data1[(alu0+1354)];
    var val12 = data1[(alu0+1355)];
    var val13 = data1[(alu0+2028)];
    var val14 = data1[(alu0+2029)];
    var val15 = data1[(alu0+2030)];
    var val16 = data1[(alu0+2031)];
    var val17 = data2[(alu1+1)];
    var val18 = data2[(alu1+2)];
    var val19 = data2[(alu1+3)];
    var val20 = data2[(alu1+80)];
    var val21 = data2[(alu1+81)];
    var val22 = data2[(alu1+82)];
    var val23 = data2[(alu1+83)];
    var val24 = data2[(alu1+160)];
    var val25 = data2[(alu1+161)];
    var val26 = data2[(alu1+162)];
    var val27 = data2[(alu1+163)];
    var val28 = data2[(alu1+240)];
    var val29 = data2[(alu1+241)];
    var val30 = data2[(alu1+242)];
    var val31 = data2[(alu1+243)];
    acc0 = (acc0+(val0*val1)+(val5*val17)+(val9*val18)+(val13*val19));
    acc1 = (acc1+(val0*val20)+(val5*val21)+(val9*val22)+(val13*val23));
    acc2 = (acc2+(val0*val24)+(val5*val25)+(val9*val26)+(val13*val27));
    acc3 = (acc3+(val0*val28)+(val5*val29)+(val9*val30)+(val13*val31));
    acc4 = (acc4+(val2*val1)+(val6*val17)+(val10*val18)+(val14*val19));
    acc5 = (acc5+(val2*val20)+(val6*val21)+(val10*val22)+(val14*val23));
    acc6 = (acc6+(val2*val24)+(val6*val25)+(val10*val26)+(val14*val27));
    acc7 = (acc7+(val2*val28)+(val6*val29)+(val10*val30)+(val14*val31));
    acc8 = (acc8+(val3*val1)+(val7*val17)+(val11*val18)+(val15*val19));
    acc9 = (acc9+(val3*val20)+(val7*val21)+(val11*val22)+(val15*val23));
    acc10 = (acc10+(val3*val24)+(val7*val25)+(val11*val26)+(val15*val27));
    acc11 = (acc11+(val3*val28)+(val7*val29)+(val11*val30)+(val15*val31));
    acc12 = (acc12+(val4*val1)+(val8*val17)+(val12*val18)+(val16*val19));
    acc13 = (acc13+(val4*val20)+(val8*val21)+(val12*val22)+(val16*val23));
    acc14 = (acc14+(val4*val24)+(val8*val25)+(val12*val26)+(val16*val27));
    acc15 = (acc15+(val4*val28)+(val8*val29)+(val12*val30)+(val16*val31));
  }
  var precast4 = gidx1;
  var precast5 = lidx0;
  var precast6 = (bitcast<u32>(precast4)<<4u);
  var precast7 = (bitcast<u32>(precast5)<<2u);
  var alu19 = (bitcast<i32>(precast6)+bitcast<i32>(precast7));
  var val32 = data3[alu19];
  var val33 = data3[(alu19+1)];
  var val34 = data3[(alu19+2)];
  var val35 = data3[(alu19+3)];
  var alu20 = ((lidx0*2704)+cast0+(gidx1*10816));
  data0[alu20] = (acc0+val32);
  data0[(alu20+676)] = (acc1+val33);
  data0[(alu20+1352)] = (acc2+val34);
  data0[(alu20+2028)] = (acc3+val35);
  data0[(alu20+1)] = (acc4+val32);
  data0[(alu20+677)] = (acc5+val33);
  data0[(alu20+1353)] = (acc6+val34);
  data0[(alu20+2029)] = (acc7+val35);
  data0[(alu20+2)] = (acc8+val32);
  data0[(alu20+678)] = (acc9+val33);
  data0[(alu20+1354)] = (acc10+val34);
  data0[(alu20+2030)] = (acc11+val35);
  data0[(alu20+3)] = (acc12+val32);
  data0[(alu20+679)] = (acc13+val33);
  data0[(alu20+1355)] = (acc14+val34);
  data0[(alu20+2031)] = (acc15+val35);
}`;

const r_13_13_32_128_4_3_3n3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 128; ridx3++) {
    var alu5 = (gidx0+alu0+(ridx3*169));
    var val0 = data1[alu5];
    var alu6 = ((lidx0*4608)+(ridx3*9));
    var val1 = data2[alu6];
    var val2 = select(0.0f, data1[(alu5+-14)], (alu1&alu2));
    var val3 = select(0.0f, data1[(alu5+-13)], alu1);
    var val4 = select(0.0f, data1[(alu5+-12)], (alu1&alu4));
    var val5 = select(0.0f, data1[(alu5+-1)], alu2);
    var val6 = select(0.0f, data1[(alu5+1)], alu4);
    var val7 = select(0.0f, data1[(alu5+12)], (alu3&alu2));
    var val8 = select(0.0f, data1[(alu5+13)], alu3);
    var val9 = select(0.0f, data1[(alu5+14)], (alu3&alu4));
    var val10 = data2[(alu6+1)];
    var val11 = data2[(alu6+2)];
    var val12 = data2[(alu6+3)];
    var val13 = data2[(alu6+4)];
    var val14 = data2[(alu6+5)];
    var val15 = data2[(alu6+6)];
    var val16 = data2[(alu6+7)];
    var val17 = data2[(alu6+8)];
    var val18 = data2[(alu6+1152)];
    var val19 = data2[(alu6+1153)];
    var val20 = data2[(alu6+1154)];
    var val21 = data2[(alu6+1155)];
    var val22 = data2[(alu6+1156)];
    var val23 = data2[(alu6+1157)];
    var val24 = data2[(alu6+1158)];
    var val25 = data2[(alu6+1159)];
    var val26 = data2[(alu6+1160)];
    var val27 = data2[(alu6+2304)];
    var val28 = data2[(alu6+2305)];
    var val29 = data2[(alu6+2306)];
    var val30 = data2[(alu6+2307)];
    var val31 = data2[(alu6+2308)];
    var val32 = data2[(alu6+2309)];
    var val33 = data2[(alu6+2310)];
    var val34 = data2[(alu6+2311)];
    var val35 = data2[(alu6+2312)];
    var val36 = data2[(alu6+3456)];
    var val37 = data2[(alu6+3457)];
    var val38 = data2[(alu6+3458)];
    var val39 = data2[(alu6+3459)];
    var val40 = data2[(alu6+3460)];
    var val41 = data2[(alu6+3461)];
    var val42 = data2[(alu6+3462)];
    var val43 = data2[(alu6+3463)];
    var val44 = data2[(alu6+3464)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val45 = data5[cast0];
  var val46 = data3[cast0];
  var val47 = data4[cast0];
  var val48 = data6[cast0];
  var alu12 = (cast0+1);
  var val49 = data5[alu12];
  var val50 = data3[alu12];
  var val51 = data4[alu12];
  var val52 = data6[alu12];
  var alu13 = (cast0+2);
  var val53 = data5[alu13];
  var val54 = data3[alu13];
  var val55 = data4[alu13];
  var val56 = data6[alu13];
  var alu14 = (cast0+3);
  var val57 = data5[alu14];
  var val58 = data3[alu14];
  var val59 = data4[alu14];
  var val60 = data6[alu14];
  var alu15 = ((lidx0*676)+gidx0+alu0);
  var alu16 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu15] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu15+169)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu15+338)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu15+507)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
}`;

const r_13_13_16_256_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 256; ridx3++) {
    var alu5 = (gidx0+alu0+(ridx3*169));
    var val0 = data1[alu5];
    var alu6 = ((lidx0*9216)+(ridx3*9));
    var val1 = data2[alu6];
    var val2 = select(0.0f, data1[(alu5+-14)], (alu1&alu2));
    var val3 = select(0.0f, data1[(alu5+-13)], alu1);
    var val4 = select(0.0f, data1[(alu5+-12)], (alu1&alu4));
    var val5 = select(0.0f, data1[(alu5+-1)], alu2);
    var val6 = select(0.0f, data1[(alu5+1)], alu4);
    var val7 = select(0.0f, data1[(alu5+12)], (alu3&alu2));
    var val8 = select(0.0f, data1[(alu5+13)], alu3);
    var val9 = select(0.0f, data1[(alu5+14)], (alu3&alu4));
    var val10 = data2[(alu6+1)];
    var val11 = data2[(alu6+2)];
    var val12 = data2[(alu6+3)];
    var val13 = data2[(alu6+4)];
    var val14 = data2[(alu6+5)];
    var val15 = data2[(alu6+6)];
    var val16 = data2[(alu6+7)];
    var val17 = data2[(alu6+8)];
    var val18 = data2[(alu6+2304)];
    var val19 = data2[(alu6+2305)];
    var val20 = data2[(alu6+2306)];
    var val21 = data2[(alu6+2307)];
    var val22 = data2[(alu6+2308)];
    var val23 = data2[(alu6+2309)];
    var val24 = data2[(alu6+2310)];
    var val25 = data2[(alu6+2311)];
    var val26 = data2[(alu6+2312)];
    var val27 = data2[(alu6+4608)];
    var val28 = data2[(alu6+4609)];
    var val29 = data2[(alu6+4610)];
    var val30 = data2[(alu6+4611)];
    var val31 = data2[(alu6+4612)];
    var val32 = data2[(alu6+4613)];
    var val33 = data2[(alu6+4614)];
    var val34 = data2[(alu6+4615)];
    var val35 = data2[(alu6+4616)];
    var val36 = data2[(alu6+6912)];
    var val37 = data2[(alu6+6913)];
    var val38 = data2[(alu6+6914)];
    var val39 = data2[(alu6+6915)];
    var val40 = data2[(alu6+6916)];
    var val41 = data2[(alu6+6917)];
    var val42 = data2[(alu6+6918)];
    var val43 = data2[(alu6+6919)];
    var val44 = data2[(alu6+6920)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val45 = data5[cast0];
  var val46 = data3[cast0];
  var val47 = data4[cast0];
  var val48 = data6[cast0];
  var alu12 = (cast0+1);
  var val49 = data5[alu12];
  var val50 = data3[alu12];
  var val51 = data4[alu12];
  var val52 = data6[alu12];
  var alu13 = (cast0+2);
  var val53 = data5[alu13];
  var val54 = data3[alu13];
  var val55 = data4[alu13];
  var val56 = data6[alu13];
  var alu14 = (cast0+3);
  var val57 = data5[alu14];
  var val58 = data3[alu14];
  var val59 = data4[alu14];
  var val60 = data6[alu14];
  var alu15 = ((lidx0*676)+gidx0+alu0);
  var alu16 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu15] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu15+169)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu15+338)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu15+507)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
}`;

const r_5_13_13_4_256_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx4 = 0; ridx4 < 256; ridx4++) {
    var alu5 = (gidx0+alu0+(ridx4*169));
    var val0 = data1[alu5];
    var alu6 = ((ridx4*9)+(gidx2*36864)+(lidx0*9216));
    var val1 = data2[alu6];
    var val2 = select(0.0f, data1[(alu5+-14)], (alu1&alu2));
    var val3 = select(0.0f, data1[(alu5+-13)], alu1);
    var val4 = select(0.0f, data1[(alu5+-12)], (alu1&alu4));
    var val5 = select(0.0f, data1[(alu5+-1)], alu2);
    var val6 = select(0.0f, data1[(alu5+1)], alu4);
    var val7 = select(0.0f, data1[(alu5+12)], (alu3&alu2));
    var val8 = select(0.0f, data1[(alu5+13)], alu3);
    var val9 = select(0.0f, data1[(alu5+14)], (alu3&alu4));
    var val10 = data2[(alu6+1)];
    var val11 = data2[(alu6+2)];
    var val12 = data2[(alu6+3)];
    var val13 = data2[(alu6+4)];
    var val14 = data2[(alu6+5)];
    var val15 = data2[(alu6+6)];
    var val16 = data2[(alu6+7)];
    var val17 = data2[(alu6+8)];
    var val18 = data2[(alu6+2304)];
    var val19 = data2[(alu6+2305)];
    var val20 = data2[(alu6+2306)];
    var val21 = data2[(alu6+2307)];
    var val22 = data2[(alu6+2308)];
    var val23 = data2[(alu6+2309)];
    var val24 = data2[(alu6+2310)];
    var val25 = data2[(alu6+2311)];
    var val26 = data2[(alu6+2312)];
    var val27 = data2[(alu6+4608)];
    var val28 = data2[(alu6+4609)];
    var val29 = data2[(alu6+4610)];
    var val30 = data2[(alu6+4611)];
    var val31 = data2[(alu6+4612)];
    var val32 = data2[(alu6+4613)];
    var val33 = data2[(alu6+4614)];
    var val34 = data2[(alu6+4615)];
    var val35 = data2[(alu6+4616)];
    var val36 = data2[(alu6+6912)];
    var val37 = data2[(alu6+6913)];
    var val38 = data2[(alu6+6914)];
    var val39 = data2[(alu6+6915)];
    var val40 = data2[(alu6+6916)];
    var val41 = data2[(alu6+6917)];
    var val42 = data2[(alu6+6918)];
    var val43 = data2[(alu6+6919)];
    var val44 = data2[(alu6+6920)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = gidx2;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu12 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val45 = data5[alu12];
  var val46 = data3[alu12];
  var val47 = data4[alu12];
  var val48 = data6[alu12];
  var alu13 = (alu12+1);
  var val49 = data5[alu13];
  var val50 = data3[alu13];
  var val51 = data4[alu13];
  var val52 = data6[alu13];
  var alu14 = (alu12+2);
  var val53 = data5[alu14];
  var val54 = data3[alu14];
  var val55 = data4[alu14];
  var val56 = data6[alu14];
  var alu15 = (alu12+3);
  var val57 = data5[alu15];
  var val58 = data3[alu15];
  var val59 = data4[alu15];
  var val60 = data6[alu15];
  var alu16 = ((lidx0*676)+gidx0+alu0+(gidx2*2704));
  var alu17 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu16] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
  var alu19 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu16+169)] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
  var alu21 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu16+338)] = (alu21*(1/(1.0f+exp2((alu21*-1.4426950408889634f)))));
  var alu23 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu16+507)] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
}`;

const r_13_13_16_64_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var lidx0 = i32(lindex.x); /* 16 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 64; ridx3++) {
    var alu5 = (gidx0+alu0+(ridx3*169));
    var val0 = data1[alu5];
    var alu6 = ((lidx0*2304)+(ridx3*9));
    var val1 = data2[alu6];
    var val2 = select(0.0f, data1[(alu5+-14)], (alu1&alu2));
    var val3 = select(0.0f, data1[(alu5+-13)], alu1);
    var val4 = select(0.0f, data1[(alu5+-12)], (alu1&alu4));
    var val5 = select(0.0f, data1[(alu5+-1)], alu2);
    var val6 = select(0.0f, data1[(alu5+1)], alu4);
    var val7 = select(0.0f, data1[(alu5+12)], (alu3&alu2));
    var val8 = select(0.0f, data1[(alu5+13)], alu3);
    var val9 = select(0.0f, data1[(alu5+14)], (alu3&alu4));
    var val10 = data2[(alu6+1)];
    var val11 = data2[(alu6+2)];
    var val12 = data2[(alu6+3)];
    var val13 = data2[(alu6+4)];
    var val14 = data2[(alu6+5)];
    var val15 = data2[(alu6+6)];
    var val16 = data2[(alu6+7)];
    var val17 = data2[(alu6+8)];
    var val18 = data2[(alu6+576)];
    var val19 = data2[(alu6+577)];
    var val20 = data2[(alu6+578)];
    var val21 = data2[(alu6+579)];
    var val22 = data2[(alu6+580)];
    var val23 = data2[(alu6+581)];
    var val24 = data2[(alu6+582)];
    var val25 = data2[(alu6+583)];
    var val26 = data2[(alu6+584)];
    var val27 = data2[(alu6+1152)];
    var val28 = data2[(alu6+1153)];
    var val29 = data2[(alu6+1154)];
    var val30 = data2[(alu6+1155)];
    var val31 = data2[(alu6+1156)];
    var val32 = data2[(alu6+1157)];
    var val33 = data2[(alu6+1158)];
    var val34 = data2[(alu6+1159)];
    var val35 = data2[(alu6+1160)];
    var val36 = data2[(alu6+1728)];
    var val37 = data2[(alu6+1729)];
    var val38 = data2[(alu6+1730)];
    var val39 = data2[(alu6+1731)];
    var val40 = data2[(alu6+1732)];
    var val41 = data2[(alu6+1733)];
    var val42 = data2[(alu6+1734)];
    var val43 = data2[(alu6+1735)];
    var val44 = data2[(alu6+1736)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val45 = data5[cast0];
  var val46 = data3[cast0];
  var val47 = data4[cast0];
  var val48 = data6[cast0];
  var alu12 = (cast0+1);
  var val49 = data5[alu12];
  var val50 = data3[alu12];
  var val51 = data4[alu12];
  var val52 = data6[alu12];
  var alu13 = (cast0+2);
  var val53 = data5[alu13];
  var val54 = data3[alu13];
  var val55 = data4[alu13];
  var val56 = data6[alu13];
  var alu14 = (cast0+3);
  var val57 = data5[alu14];
  var val58 = data3[alu14];
  var val59 = data4[alu14];
  var val60 = data6[alu14];
  var alu15 = ((lidx0*676)+gidx0+alu0);
  var alu16 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu15] = (alu16*(1/(1.0f+exp2((alu16*-1.4426950408889634f)))));
  var alu18 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu15+169)] = (alu18*(1/(1.0f+exp2((alu18*-1.4426950408889634f)))));
  var alu20 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu15+338)] = (alu20*(1/(1.0f+exp2((alu20*-1.4426950408889634f)))));
  var alu22 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu15+507)] = (alu22*(1/(1.0f+exp2((alu22*-1.4426950408889634f)))));
}`;

const r_5_13_13_4_80_4_3_3 = `enable f16;
fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f16>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 13 */
  var gidx1 = i32(gindex.y); /* 13 */
  var gidx2 = i32(gindex.z); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var alu0 = (gidx1*13);
  var alu1 = ((gidx1<1)!=true);
  var alu2 = ((gidx0<1)!=true);
  var alu3 = (gidx1<12);
  var alu4 = (gidx0<12);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx4 = 0; ridx4 < 80; ridx4++) {
    var alu5 = (gidx0+alu0+(ridx4*169));
    var val0 = data1[alu5];
    var alu6 = ((ridx4*9)+(gidx2*11520)+(lidx0*2880));
    var val1 = data2[alu6];
    var val2 = select(0.0f, data1[(alu5+-14)], (alu1&alu2));
    var val3 = select(0.0f, data1[(alu5+-13)], alu1);
    var val4 = select(0.0f, data1[(alu5+-12)], (alu1&alu4));
    var val5 = select(0.0f, data1[(alu5+-1)], alu2);
    var val6 = select(0.0f, data1[(alu5+1)], alu4);
    var val7 = select(0.0f, data1[(alu5+12)], (alu3&alu2));
    var val8 = select(0.0f, data1[(alu5+13)], alu3);
    var val9 = select(0.0f, data1[(alu5+14)], (alu3&alu4));
    var val10 = data2[(alu6+1)];
    var val11 = data2[(alu6+2)];
    var val12 = data2[(alu6+3)];
    var val13 = data2[(alu6+4)];
    var val14 = data2[(alu6+5)];
    var val15 = data2[(alu6+6)];
    var val16 = data2[(alu6+7)];
    var val17 = data2[(alu6+8)];
    var val18 = data2[(alu6+720)];
    var val19 = data2[(alu6+721)];
    var val20 = data2[(alu6+722)];
    var val21 = data2[(alu6+723)];
    var val22 = data2[(alu6+724)];
    var val23 = data2[(alu6+725)];
    var val24 = data2[(alu6+726)];
    var val25 = data2[(alu6+727)];
    var val26 = data2[(alu6+728)];
    var val27 = data2[(alu6+1440)];
    var val28 = data2[(alu6+1441)];
    var val29 = data2[(alu6+1442)];
    var val30 = data2[(alu6+1443)];
    var val31 = data2[(alu6+1444)];
    var val32 = data2[(alu6+1445)];
    var val33 = data2[(alu6+1446)];
    var val34 = data2[(alu6+1447)];
    var val35 = data2[(alu6+1448)];
    var val36 = data2[(alu6+2160)];
    var val37 = data2[(alu6+2161)];
    var val38 = data2[(alu6+2162)];
    var val39 = data2[(alu6+2163)];
    var val40 = data2[(alu6+2164)];
    var val41 = data2[(alu6+2165)];
    var val42 = data2[(alu6+2166)];
    var val43 = data2[(alu6+2167)];
    var val44 = data2[(alu6+2168)];
    acc0 = (acc0+(val2*val1)+(val5*val12)+(val7*val15)+(val3*val10)+(val0*val13)+(val8*val16)+(val4*val11)+(val6*val14)+(val9*val17));
    acc1 = (acc1+(val2*val18)+(val5*val21)+(val7*val24)+(val3*val19)+(val0*val22)+(val8*val25)+(val4*val20)+(val6*val23)+(val9*val26));
    acc2 = (acc2+(val2*val27)+(val5*val30)+(val7*val33)+(val3*val28)+(val0*val31)+(val8*val34)+(val4*val29)+(val6*val32)+(val9*val35));
    acc3 = (acc3+(val2*val36)+(val5*val39)+(val7*val42)+(val3*val37)+(val0*val40)+(val8*val43)+(val4*val38)+(val6*val41)+(val9*val44));
  }
  var precast0 = gidx2;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu12 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val45 = data5[alu12];
  var val46 = data3[alu12];
  var val47 = data4[alu12];
  var val48 = data6[alu12];
  var alu13 = (alu12+1);
  var val49 = data5[alu13];
  var val50 = data3[alu13];
  var val51 = data4[alu13];
  var val52 = data6[alu13];
  var alu14 = (alu12+2);
  var val53 = data5[alu14];
  var val54 = data3[alu14];
  var val55 = data4[alu14];
  var val56 = data6[alu14];
  var alu15 = (alu12+3);
  var val57 = data5[alu15];
  var val58 = data3[alu15];
  var val59 = data4[alu15];
  var val60 = data6[alu15];
  var alu16 = ((lidx0*676)+gidx0+alu0+(gidx2*2704));
  var alu17 = (((acc0-val46)*val47*(f32((1/sqrt((val45+(f16(0.001f))))))))+val48);
  data0[alu16] = (alu17*(1/(1.0f+exp2((alu17*-1.4426950408889634f)))));
  var alu19 = (((acc1-val50)*val51*(f32((1/sqrt((val49+(f16(0.001f))))))))+val52);
  data0[(alu16+169)] = (alu19*(1/(1.0f+exp2((alu19*-1.4426950408889634f)))));
  var alu21 = (((acc2-val54)*val55*(f32((1/sqrt((val53+(f16(0.001f))))))))+val56);
  data0[(alu16+338)] = (alu21*(1/(1.0f+exp2((alu21*-1.4426950408889634f)))));
  var alu23 = (((acc3-val58)*val59*(f32((1/sqrt((val57+(f16(0.001f))))))))+val60);
  data0[(alu16+507)] = (alu23*(1/(1.0f+exp2((alu23*-1.4426950408889634f)))));
}`;

const r_169_16_16_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var lidx0 = i32(lindex.x); /* 16 */
  var precast0 = lidx0;
  var cast0 = bitcast<u32>(precast0);
  var precast1 = (cast0<<8u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx2 = 0; ridx2 < 16; ridx2++) {
    var precast2 = ridx2;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu0 = (gidx0+(ridx2*676));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast1)+bitcast<i32>(precast3));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+169)];
    var val3 = data1[(alu0+338)];
    var val4 = data1[(alu0+507)];
    var val5 = data2[(alu1+1)];
    var val6 = data2[(alu1+2)];
    var val7 = data2[(alu1+3)];
    var val8 = data2[(alu1+64)];
    var val9 = data2[(alu1+65)];
    var val10 = data2[(alu1+66)];
    var val11 = data2[(alu1+67)];
    var val12 = data2[(alu1+128)];
    var val13 = data2[(alu1+129)];
    var val14 = data2[(alu1+130)];
    var val15 = data2[(alu1+131)];
    var val16 = data2[(alu1+192)];
    var val17 = data2[(alu1+193)];
    var val18 = data2[(alu1+194)];
    var val19 = data2[(alu1+195)];
    acc0 = (acc0+(val0*val1)+(val2*val5)+(val3*val6)+(val4*val7));
    acc1 = (acc1+(val0*val8)+(val2*val9)+(val3*val10)+(val4*val11));
    acc2 = (acc2+(val0*val12)+(val2*val13)+(val3*val14)+(val4*val15));
    acc3 = (acc3+(val0*val16)+(val2*val17)+(val3*val18)+(val4*val19));
  }
  var precast4 = (cast0<<2u);
  var cast1 = bitcast<i32>(precast4);
  var val20 = data3[cast1];
  var val21 = data3[(cast1+1)];
  var val22 = data3[(cast1+2)];
  var val23 = data3[(cast1+3)];
  var alu7 = (gidx0+(lidx0*676));
  data0[alu7] = (acc0+val20);
  data0[(alu7+169)] = (acc1+val21);
  data0[(alu7+338)] = (acc2+val22);
  data0[(alu7+507)] = (acc3+val23);
}`;

const r_5_169_4_20_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 169 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  for (var ridx3 = 0; ridx3 < 20; ridx3++) {
    var precast0 = ridx3;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = (gidx0+(ridx3*676));
    var val0 = data1[alu0];
    var alu1 = (bitcast<i32>(precast1)+(gidx1*1280)+(lidx0*320));
    var val1 = data2[alu1];
    var val2 = data1[(alu0+169)];
    var val3 = data1[(alu0+338)];
    var val4 = data1[(alu0+507)];
    var val5 = data2[(alu1+1)];
    var val6 = data2[(alu1+2)];
    var val7 = data2[(alu1+3)];
    var val8 = data2[(alu1+80)];
    var val9 = data2[(alu1+81)];
    var val10 = data2[(alu1+82)];
    var val11 = data2[(alu1+83)];
    var val12 = data2[(alu1+160)];
    var val13 = data2[(alu1+161)];
    var val14 = data2[(alu1+162)];
    var val15 = data2[(alu1+163)];
    var val16 = data2[(alu1+240)];
    var val17 = data2[(alu1+241)];
    var val18 = data2[(alu1+242)];
    var val19 = data2[(alu1+243)];
    acc0 = (acc0+(val0*val1)+(val2*val5)+(val3*val6)+(val4*val7));
    acc1 = (acc1+(val0*val8)+(val2*val9)+(val3*val10)+(val4*val11));
    acc2 = (acc2+(val0*val12)+(val2*val13)+(val3*val14)+(val4*val15));
    acc3 = (acc3+(val0*val16)+(val2*val17)+(val3*val18)+(val4*val19));
  }
  var precast2 = gidx1;
  var precast3 = lidx0;
  var precast4 = (bitcast<u32>(precast2)<<4u);
  var precast5 = (bitcast<u32>(precast3)<<2u);
  var alu7 = (bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val20 = data3[alu7];
  var val21 = data3[(alu7+1)];
  var val22 = data3[(alu7+2)];
  var val23 = data3[(alu7+3)];
  var alu8 = ((lidx0*676)+gidx0+(gidx1*2704));
  data0[alu8] = (acc0+val20);
  data0[(alu8+169)] = (acc1+val21);
  data0[(alu8+338)] = (acc2+val22);
  data0[(alu8+507)] = (acc3+val23);
}`;

const r_1183_4_3_16 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data3:array<f32>;
@group(0) @binding(4)var<storage,read_write>data5:array<f32>;
@compute @workgroup_size(4,3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 3 */
  var alu0 = (gidx0*3);
  var alu1 = (lidx1+alu0);
  var alu2 = ((lidx0*2704)+alu1);
  var alu3 = ((lidx0*10816)+alu1);
  var alu4 = ((lidx0*43264)+alu1);
  var alu5 = (alu1<2704);
  var val0 = select(0.0f, data1[alu4], alu5);
  var val1 = select(0.0f, data1[(alu4+2704)], alu5);
  var val2 = select(0.0f, data1[(alu4+5408)], alu5);
  var val3 = select(0.0f, data1[(alu4+8112)], alu5);
  var val4 = select(0.0f, data1[(alu4+10816)], alu5);
  var val5 = select(0.0f, data1[(alu4+13520)], alu5);
  var val6 = select(0.0f, data1[(alu4+16224)], alu5);
  var val7 = select(0.0f, data1[(alu4+18928)], alu5);
  var val8 = select(0.0f, data1[(alu4+21632)], alu5);
  var val9 = select(0.0f, data1[(alu4+24336)], alu5);
  var val10 = select(0.0f, data1[(alu4+27040)], alu5);
  var val11 = select(0.0f, data1[(alu4+29744)], alu5);
  var val12 = select(0.0f, data1[(alu4+32448)], alu5);
  var val13 = select(0.0f, data1[(alu4+35152)], alu5);
  var val14 = select(0.0f, data1[(alu4+37856)], alu5);
  var val15 = select(0.0f, data1[(alu4+40560)], alu5);
  var alu6 = (alu1<3380);
  var alu7 = (alu6!=true);
  var val16 = select(0.0f, data5[(alu2+-3380)], alu7);
  var val17 = select(0.0f, data5[(alu2+-3211)], alu7);
  var val18 = select(0.0f, data5[(alu2+-3042)], alu7);
  var val19 = select(0.0f, data5[(alu2+-2873)], alu7);
  var val20 = select(0.0f, data5[(alu2+-2704)], alu7);
  var val21 = select(0.0f, data5[(alu2+-2535)], alu7);
  var val22 = select(0.0f, data5[(alu2+-2366)], alu7);
  var val23 = select(0.0f, data5[(alu2+-2197)], alu7);
  var val24 = select(0.0f, data5[(alu2+-2028)], alu7);
  var val25 = select(0.0f, data5[(alu2+-1859)], alu7);
  var val26 = select(0.0f, data5[(alu2+-1690)], alu7);
  var val27 = select(0.0f, data5[(alu2+-1521)], alu7);
  var val28 = select(0.0f, data5[(alu2+-1352)], alu7);
  var val29 = select(0.0f, data5[(alu2+-1183)], alu7);
  var val30 = select(0.0f, data5[(alu2+-1014)], alu7);
  var val31 = select(0.0f, data5[(alu2+-845)], alu7);
  var alu8 = ((alu5!=true)&alu6);
  var val32 = select(0.0f, data3[alu3], alu8);
  var val33 = select(0.0f, data3[(alu3+-2704)], alu8);
  var val34 = select(0.0f, data3[(alu3+-2028)], alu8);
  var val35 = select(0.0f, data3[(alu3+-1352)], alu8);
  var val36 = select(0.0f, data3[(alu3+-676)], alu8);
  var val37 = select(0.0f, data3[(alu3+676)], alu8);
  var val38 = select(0.0f, data3[(alu3+1352)], alu8);
  var val39 = select(0.0f, data3[(alu3+2028)], alu8);
  var val40 = select(0.0f, data3[(alu3+2704)], alu8);
  var val41 = select(0.0f, data3[(alu3+3380)], alu8);
  var val42 = select(0.0f, data3[(alu3+4056)], alu8);
  var val43 = select(0.0f, data3[(alu3+4732)], alu8);
  var val44 = select(0.0f, data3[(alu3+5408)], alu8);
  var val45 = select(0.0f, data3[(alu3+6084)], alu8);
  var val46 = select(0.0f, data3[(alu3+6760)], alu8);
  var val47 = select(0.0f, data3[(alu3+7436)], alu8);
  var alu9 = (val0+val33+val16);
  var alu10 = (val1+val34+val17);
  var alu11 = (val2+val35+val18);
  var alu12 = (val3+val36+val19);
  var alu13 = (val4+val32+val20);
  var alu14 = (val5+val37+val21);
  var alu15 = (val6+val38+val22);
  var alu16 = (val7+val39+val23);
  var alu17 = (val8+val40+val24);
  var alu18 = (val9+val41+val25);
  var alu19 = (val10+val42+val26);
  var alu20 = (val11+val43+val27);
  var alu21 = (val12+val44+val28);
  var alu22 = (val13+val45+val29);
  var alu23 = (val14+val46+val30);
  var alu24 = (val15+val47+val31);
  var alu25 = select(alu9,alu10,(alu9<alu10));
  var alu26 = select(alu25,alu11,(alu25<alu11));
  var alu27 = select(alu26,alu12,(alu26<alu12));
  var alu28 = select(alu27,alu13,(alu27<alu13));
  var alu29 = select(alu28,alu14,(alu28<alu14));
  var alu30 = select(alu29,alu15,(alu29<alu15));
  var alu31 = select(alu30,alu16,(alu30<alu16));
  var alu32 = select(alu31,alu17,(alu31<alu17));
  var alu33 = select(alu32,alu18,(alu32<alu18));
  var alu34 = select(alu33,alu19,(alu33<alu19));
  var alu35 = select(alu34,alu20,(alu34<alu20));
  var alu36 = select(alu35,alu21,(alu35<alu21));
  var alu37 = select(alu36,alu22,(alu36<alu22));
  var alu38 = select(alu37,alu23,(alu37<alu23));
  data0[(lidx1+alu0+(lidx0*3549))] = select(alu38,alu24,(alu38<alu24));
}`;

const E_5_1183_16_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data2:array<f32>;
@group(0) @binding(3)var<storage,read_write>data4:array<f32>;
@group(0) @binding(4)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 16 */
  var alu0 = (gidx0*3);
  var alu1 = (alu0+(gidx1*2704)+(lidx0*169));
  var alu2 = (alu0+(gidx1*10816)+(lidx0*676));
  var alu3 = (alu0+(gidx1*43264)+(lidx0*2704));
  var alu4 = (gidx0<901);
  var val0 = select(0.0f, data2[(alu3+1)], alu4);
  var val1 = select(0.0f, data2[(alu3+2)], alu4);
  var alu5 = (gidx0<902);
  var val2 = select(0.0f, data2[alu3], alu5);
  var alu6 = (gidx0<1126);
  var alu7 = (gidx0<1127);
  var alu8 = (alu4!=true);
  var val3 = select(0.0f, data6[(alu1+-3378)], (alu6!=true));
  var alu9 = (alu7!=true);
  var val4 = select(0.0f, data6[(alu1+-3380)], alu9);
  var val5 = select(0.0f, data6[(alu1+-3379)], alu9);
  var val6 = select(0.0f, data4[(alu2+-2702)], (alu8&alu6));
  var val7 = select(0.0f, data4[(alu2+-2703)], (alu8&alu7));
  var val8 = select(0.0f, data4[(alu2+-2704)], ((alu5!=true)&alu7));
  var alu10 = ((lidx0*3549)+alu0+(gidx1*56784));
  data0[alu10] = (1/(1.0f+exp2(((val2+val8+val4)*-1.4426950408889634f))));
  data0[(alu10+1)] = (1/(1.0f+exp2(((val0+val7+val5)*-1.4426950408889634f))));
  data0[(alu10+2)] = (1/(1.0f+exp2(((val1+val6+val3)*-1.4426950408889634f))));
}`;

const r_1183_4_3_16n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data3:array<f32>;
@group(0) @binding(4)var<storage,read_write>data5:array<f32>;
@group(0) @binding(5)var<storage,read_write>data7:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var lidx0 = i32(lindex.x); /* 4 */
  var alu0 = (gidx0*3);
  var alu1 = (alu0+(lidx0*2704));
  var alu2 = (alu0+(lidx0*3549));
  var val0 = data7[alu2];
  var alu3 = (alu0+(lidx0*10816));
  var alu4 = (alu0+(lidx0*43264));
  var alu5 = (alu2+1);
  var val1 = data7[alu5];
  var alu6 = (alu2+2);
  var val2 = data7[alu6];
  var alu7 = (gidx0<901);
  var val3 = select(0.0f, data1[(alu4+1)], alu7);
  var val4 = select(0.0f, data1[(alu4+2)], alu7);
  var val5 = select(0.0f, data1[(alu4+2705)], alu7);
  var val6 = select(0.0f, data1[(alu4+2706)], alu7);
  var val7 = select(0.0f, data1[(alu4+5409)], alu7);
  var val8 = select(0.0f, data1[(alu4+5410)], alu7);
  var val9 = select(0.0f, data1[(alu4+8113)], alu7);
  var val10 = select(0.0f, data1[(alu4+8114)], alu7);
  var val11 = select(0.0f, data1[(alu4+10817)], alu7);
  var val12 = select(0.0f, data1[(alu4+10818)], alu7);
  var val13 = select(0.0f, data1[(alu4+13521)], alu7);
  var val14 = select(0.0f, data1[(alu4+13522)], alu7);
  var val15 = select(0.0f, data1[(alu4+16225)], alu7);
  var val16 = select(0.0f, data1[(alu4+16226)], alu7);
  var val17 = select(0.0f, data1[(alu4+18929)], alu7);
  var val18 = select(0.0f, data1[(alu4+18930)], alu7);
  var val19 = select(0.0f, data1[(alu4+21633)], alu7);
  var val20 = select(0.0f, data1[(alu4+21634)], alu7);
  var val21 = select(0.0f, data1[(alu4+24337)], alu7);
  var val22 = select(0.0f, data1[(alu4+24338)], alu7);
  var val23 = select(0.0f, data1[(alu4+27041)], alu7);
  var val24 = select(0.0f, data1[(alu4+27042)], alu7);
  var val25 = select(0.0f, data1[(alu4+29745)], alu7);
  var val26 = select(0.0f, data1[(alu4+29746)], alu7);
  var val27 = select(0.0f, data1[(alu4+32449)], alu7);
  var val28 = select(0.0f, data1[(alu4+32450)], alu7);
  var val29 = select(0.0f, data1[(alu4+35153)], alu7);
  var val30 = select(0.0f, data1[(alu4+35154)], alu7);
  var val31 = select(0.0f, data1[(alu4+37857)], alu7);
  var val32 = select(0.0f, data1[(alu4+37858)], alu7);
  var val33 = select(0.0f, data1[(alu4+40561)], alu7);
  var val34 = select(0.0f, data1[(alu4+40562)], alu7);
  var alu8 = (gidx0<902);
  var val35 = select(0.0f, data1[alu4], alu8);
  var val36 = select(0.0f, data1[(alu4+2704)], alu8);
  var val37 = select(0.0f, data1[(alu4+5408)], alu8);
  var val38 = select(0.0f, data1[(alu4+8112)], alu8);
  var val39 = select(0.0f, data1[(alu4+10816)], alu8);
  var val40 = select(0.0f, data1[(alu4+13520)], alu8);
  var val41 = select(0.0f, data1[(alu4+16224)], alu8);
  var val42 = select(0.0f, data1[(alu4+18928)], alu8);
  var val43 = select(0.0f, data1[(alu4+21632)], alu8);
  var val44 = select(0.0f, data1[(alu4+24336)], alu8);
  var val45 = select(0.0f, data1[(alu4+27040)], alu8);
  var val46 = select(0.0f, data1[(alu4+29744)], alu8);
  var val47 = select(0.0f, data1[(alu4+32448)], alu8);
  var val48 = select(0.0f, data1[(alu4+35152)], alu8);
  var val49 = select(0.0f, data1[(alu4+37856)], alu8);
  var val50 = select(0.0f, data1[(alu4+40560)], alu8);
  var alu9 = (gidx0<1126);
  var alu10 = (gidx0<1127);
  var alu11 = (alu7!=true);
  var alu12 = (alu9!=true);
  var val51 = select(0.0f, data5[(alu1+-3378)], alu12);
  var val52 = select(0.0f, data5[(alu1+-3209)], alu12);
  var val53 = select(0.0f, data5[(alu1+-3040)], alu12);
  var val54 = select(0.0f, data5[(alu1+-2871)], alu12);
  var val55 = select(0.0f, data5[(alu1+-2702)], alu12);
  var val56 = select(0.0f, data5[(alu1+-2533)], alu12);
  var val57 = select(0.0f, data5[(alu1+-2364)], alu12);
  var val58 = select(0.0f, data5[(alu1+-2195)], alu12);
  var val59 = select(0.0f, data5[(alu1+-2026)], alu12);
  var val60 = select(0.0f, data5[(alu1+-1857)], alu12);
  var val61 = select(0.0f, data5[(alu1+-1688)], alu12);
  var val62 = select(0.0f, data5[(alu1+-1519)], alu12);
  var val63 = select(0.0f, data5[(alu1+-1350)], alu12);
  var val64 = select(0.0f, data5[(alu1+-1181)], alu12);
  var val65 = select(0.0f, data5[(alu1+-1012)], alu12);
  var val66 = select(0.0f, data5[(alu1+-843)], alu12);
  var alu13 = (alu10!=true);
  var val67 = select(0.0f, data5[(alu1+-3380)], alu13);
  var val68 = select(0.0f, data5[(alu1+-3379)], alu13);
  var val69 = select(0.0f, data5[(alu1+-3211)], alu13);
  var val70 = select(0.0f, data5[(alu1+-3210)], alu13);
  var val71 = select(0.0f, data5[(alu1+-3042)], alu13);
  var val72 = select(0.0f, data5[(alu1+-3041)], alu13);
  var val73 = select(0.0f, data5[(alu1+-2873)], alu13);
  var val74 = select(0.0f, data5[(alu1+-2872)], alu13);
  var val75 = select(0.0f, data5[(alu1+-2704)], alu13);
  var val76 = select(0.0f, data5[(alu1+-2703)], alu13);
  var val77 = select(0.0f, data5[(alu1+-2535)], alu13);
  var val78 = select(0.0f, data5[(alu1+-2534)], alu13);
  var val79 = select(0.0f, data5[(alu1+-2366)], alu13);
  var val80 = select(0.0f, data5[(alu1+-2365)], alu13);
  var val81 = select(0.0f, data5[(alu1+-2197)], alu13);
  var val82 = select(0.0f, data5[(alu1+-2196)], alu13);
  var val83 = select(0.0f, data5[(alu1+-2028)], alu13);
  var val84 = select(0.0f, data5[(alu1+-2027)], alu13);
  var val85 = select(0.0f, data5[(alu1+-1859)], alu13);
  var val86 = select(0.0f, data5[(alu1+-1858)], alu13);
  var val87 = select(0.0f, data5[(alu1+-1690)], alu13);
  var val88 = select(0.0f, data5[(alu1+-1689)], alu13);
  var val89 = select(0.0f, data5[(alu1+-1521)], alu13);
  var val90 = select(0.0f, data5[(alu1+-1520)], alu13);
  var val91 = select(0.0f, data5[(alu1+-1352)], alu13);
  var val92 = select(0.0f, data5[(alu1+-1351)], alu13);
  var val93 = select(0.0f, data5[(alu1+-1183)], alu13);
  var val94 = select(0.0f, data5[(alu1+-1182)], alu13);
  var val95 = select(0.0f, data5[(alu1+-1014)], alu13);
  var val96 = select(0.0f, data5[(alu1+-1013)], alu13);
  var val97 = select(0.0f, data5[(alu1+-845)], alu13);
  var val98 = select(0.0f, data5[(alu1+-844)], alu13);
  var alu14 = (alu11&alu9);
  var val99 = select(0.0f, data3[(alu3+-2702)], alu14);
  var val100 = select(0.0f, data3[(alu3+-2026)], alu14);
  var val101 = select(0.0f, data3[(alu3+-1350)], alu14);
  var val102 = select(0.0f, data3[(alu3+-674)], alu14);
  var val103 = select(0.0f, data3[(alu3+2)], alu14);
  var val104 = select(0.0f, data3[(alu3+678)], alu14);
  var val105 = select(0.0f, data3[(alu3+1354)], alu14);
  var val106 = select(0.0f, data3[(alu3+2030)], alu14);
  var val107 = select(0.0f, data3[(alu3+2706)], alu14);
  var val108 = select(0.0f, data3[(alu3+3382)], alu14);
  var val109 = select(0.0f, data3[(alu3+4058)], alu14);
  var val110 = select(0.0f, data3[(alu3+4734)], alu14);
  var val111 = select(0.0f, data3[(alu3+5410)], alu14);
  var val112 = select(0.0f, data3[(alu3+6086)], alu14);
  var val113 = select(0.0f, data3[(alu3+6762)], alu14);
  var val114 = select(0.0f, data3[(alu3+7438)], alu14);
  var alu15 = (alu11&alu10);
  var val115 = select(0.0f, data3[(alu3+-2703)], alu15);
  var val116 = select(0.0f, data3[(alu3+-2027)], alu15);
  var val117 = select(0.0f, data3[(alu3+-1351)], alu15);
  var val118 = select(0.0f, data3[(alu3+-675)], alu15);
  var val119 = select(0.0f, data3[(alu3+1)], alu15);
  var val120 = select(0.0f, data3[(alu3+677)], alu15);
  var val121 = select(0.0f, data3[(alu3+1353)], alu15);
  var val122 = select(0.0f, data3[(alu3+2029)], alu15);
  var val123 = select(0.0f, data3[(alu3+2705)], alu15);
  var val124 = select(0.0f, data3[(alu3+3381)], alu15);
  var val125 = select(0.0f, data3[(alu3+4057)], alu15);
  var val126 = select(0.0f, data3[(alu3+4733)], alu15);
  var val127 = select(0.0f, data3[(alu3+5409)], alu15);
  var val128 = select(0.0f, data3[(alu3+6085)], alu15);
  var val129 = select(0.0f, data3[(alu3+6761)], alu15);
  var val130 = select(0.0f, data3[(alu3+7437)], alu15);
  var alu16 = ((alu8!=true)&alu10);
  var val131 = select(0.0f, data3[alu3], alu16);
  var val132 = select(0.0f, data3[(alu3+-2704)], alu16);
  var val133 = select(0.0f, data3[(alu3+-2028)], alu16);
  var val134 = select(0.0f, data3[(alu3+-1352)], alu16);
  var val135 = select(0.0f, data3[(alu3+-676)], alu16);
  var val136 = select(0.0f, data3[(alu3+676)], alu16);
  var val137 = select(0.0f, data3[(alu3+1352)], alu16);
  var val138 = select(0.0f, data3[(alu3+2028)], alu16);
  var val139 = select(0.0f, data3[(alu3+2704)], alu16);
  var val140 = select(0.0f, data3[(alu3+3380)], alu16);
  var val141 = select(0.0f, data3[(alu3+4056)], alu16);
  var val142 = select(0.0f, data3[(alu3+4732)], alu16);
  var val143 = select(0.0f, data3[(alu3+5408)], alu16);
  var val144 = select(0.0f, data3[(alu3+6084)], alu16);
  var val145 = select(0.0f, data3[(alu3+6760)], alu16);
  var val146 = select(0.0f, data3[(alu3+7436)], alu16);
  data0[alu2] = (1/(exp2((((val35+val132+val67)-val0)*1.4426950408889634f))+exp2((((val36+val133+val69)-val0)*1.4426950408889634f))+exp2((((val37+val134+val71)-val0)*1.4426950408889634f))+exp2((((val38+val135+val73)-val0)*1.4426950408889634f))+exp2((((val39+val131+val75)-val0)*1.4426950408889634f))+exp2((((val40+val136+val77)-val0)*1.4426950408889634f))+exp2((((val41+val137+val79)-val0)*1.4426950408889634f))+exp2((((val42+val138+val81)-val0)*1.4426950408889634f))+exp2((((val43+val139+val83)-val0)*1.4426950408889634f))+exp2((((val44+val140+val85)-val0)*1.4426950408889634f))+exp2((((val45+val141+val87)-val0)*1.4426950408889634f))+exp2((((val46+val142+val89)-val0)*1.4426950408889634f))+exp2((((val47+val143+val91)-val0)*1.4426950408889634f))+exp2((((val48+val144+val93)-val0)*1.4426950408889634f))+exp2((((val49+val145+val95)-val0)*1.4426950408889634f))+exp2((((val50+val146+val97)-val0)*1.4426950408889634f))));
  data0[alu5] = (1/(exp2((((val3+val115+val68)-val1)*1.4426950408889634f))+exp2((((val5+val116+val70)-val1)*1.4426950408889634f))+exp2((((val7+val117+val72)-val1)*1.4426950408889634f))+exp2((((val9+val118+val74)-val1)*1.4426950408889634f))+exp2((((val11+val119+val76)-val1)*1.4426950408889634f))+exp2((((val13+val120+val78)-val1)*1.4426950408889634f))+exp2((((val15+val121+val80)-val1)*1.4426950408889634f))+exp2((((val17+val122+val82)-val1)*1.4426950408889634f))+exp2((((val19+val123+val84)-val1)*1.4426950408889634f))+exp2((((val21+val124+val86)-val1)*1.4426950408889634f))+exp2((((val23+val125+val88)-val1)*1.4426950408889634f))+exp2((((val25+val126+val90)-val1)*1.4426950408889634f))+exp2((((val27+val127+val92)-val1)*1.4426950408889634f))+exp2((((val29+val128+val94)-val1)*1.4426950408889634f))+exp2((((val31+val129+val96)-val1)*1.4426950408889634f))+exp2((((val33+val130+val98)-val1)*1.4426950408889634f))));
  data0[alu6] = (1/(exp2((((val4+val99+val51)-val2)*1.4426950408889634f))+exp2((((val6+val100+val52)-val2)*1.4426950408889634f))+exp2((((val8+val101+val53)-val2)*1.4426950408889634f))+exp2((((val10+val102+val54)-val2)*1.4426950408889634f))+exp2((((val12+val103+val55)-val2)*1.4426950408889634f))+exp2((((val14+val104+val56)-val2)*1.4426950408889634f))+exp2((((val16+val105+val57)-val2)*1.4426950408889634f))+exp2((((val18+val106+val58)-val2)*1.4426950408889634f))+exp2((((val20+val107+val59)-val2)*1.4426950408889634f))+exp2((((val22+val108+val60)-val2)*1.4426950408889634f))+exp2((((val24+val109+val61)-val2)*1.4426950408889634f))+exp2((((val26+val110+val62)-val2)*1.4426950408889634f))+exp2((((val28+val111+val63)-val2)*1.4426950408889634f))+exp2((((val30+val112+val64)-val2)*1.4426950408889634f))+exp2((((val32+val113+val65)-val2)*1.4426950408889634f))+exp2((((val34+val114+val66)-val2)*1.4426950408889634f))));
}`;

const r_1183_4_3_16n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data3:array<f32>;
@group(0) @binding(4)var<storage,read_write>data5:array<f32>;
@group(0) @binding(5)var<storage,read_write>data7:array<f32>;
@group(0) @binding(6)var<storage,read_write>data8:array<f32>;
@group(0) @binding(7)var<storage,read_write>data9:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var lidx0 = i32(lindex.x); /* 4 */
  var val0 = data9[0];
  var val1 = data9[1];
  var val2 = data9[2];
  var val3 = data9[3];
  var val4 = data9[4];
  var val5 = data9[5];
  var val6 = data9[6];
  var val7 = data9[7];
  var val8 = data9[8];
  var val9 = data9[9];
  var val10 = data9[10];
  var val11 = data9[11];
  var val12 = data9[12];
  var val13 = data9[13];
  var val14 = data9[14];
  var val15 = data9[15];
  var alu0 = (gidx0*3);
  var alu1 = (alu0+(lidx0*2704));
  var alu2 = (alu0+(lidx0*3549));
  var val16 = data7[alu2];
  var val17 = data8[alu2];
  var alu3 = (alu0+(lidx0*10816));
  var alu4 = (alu0+(lidx0*43264));
  var alu5 = (alu2+1);
  var val18 = data7[alu5];
  var val19 = data8[alu5];
  var alu6 = (alu2+2);
  var val20 = data7[alu6];
  var val21 = data8[alu6];
  var alu7 = (gidx0<901);
  var val22 = select(0.0f, data1[(alu4+1)], alu7);
  var val23 = select(0.0f, data1[(alu4+2)], alu7);
  var val24 = select(0.0f, data1[(alu4+2705)], alu7);
  var val25 = select(0.0f, data1[(alu4+2706)], alu7);
  var val26 = select(0.0f, data1[(alu4+5409)], alu7);
  var val27 = select(0.0f, data1[(alu4+5410)], alu7);
  var val28 = select(0.0f, data1[(alu4+8113)], alu7);
  var val29 = select(0.0f, data1[(alu4+8114)], alu7);
  var val30 = select(0.0f, data1[(alu4+10817)], alu7);
  var val31 = select(0.0f, data1[(alu4+10818)], alu7);
  var val32 = select(0.0f, data1[(alu4+13521)], alu7);
  var val33 = select(0.0f, data1[(alu4+13522)], alu7);
  var val34 = select(0.0f, data1[(alu4+16225)], alu7);
  var val35 = select(0.0f, data1[(alu4+16226)], alu7);
  var val36 = select(0.0f, data1[(alu4+18929)], alu7);
  var val37 = select(0.0f, data1[(alu4+18930)], alu7);
  var val38 = select(0.0f, data1[(alu4+21633)], alu7);
  var val39 = select(0.0f, data1[(alu4+21634)], alu7);
  var val40 = select(0.0f, data1[(alu4+24337)], alu7);
  var val41 = select(0.0f, data1[(alu4+24338)], alu7);
  var val42 = select(0.0f, data1[(alu4+27041)], alu7);
  var val43 = select(0.0f, data1[(alu4+27042)], alu7);
  var val44 = select(0.0f, data1[(alu4+29745)], alu7);
  var val45 = select(0.0f, data1[(alu4+29746)], alu7);
  var val46 = select(0.0f, data1[(alu4+32449)], alu7);
  var val47 = select(0.0f, data1[(alu4+32450)], alu7);
  var val48 = select(0.0f, data1[(alu4+35153)], alu7);
  var val49 = select(0.0f, data1[(alu4+35154)], alu7);
  var val50 = select(0.0f, data1[(alu4+37857)], alu7);
  var val51 = select(0.0f, data1[(alu4+37858)], alu7);
  var val52 = select(0.0f, data1[(alu4+40561)], alu7);
  var val53 = select(0.0f, data1[(alu4+40562)], alu7);
  var alu8 = (gidx0<902);
  var val54 = select(0.0f, data1[alu4], alu8);
  var val55 = select(0.0f, data1[(alu4+2704)], alu8);
  var val56 = select(0.0f, data1[(alu4+5408)], alu8);
  var val57 = select(0.0f, data1[(alu4+8112)], alu8);
  var val58 = select(0.0f, data1[(alu4+10816)], alu8);
  var val59 = select(0.0f, data1[(alu4+13520)], alu8);
  var val60 = select(0.0f, data1[(alu4+16224)], alu8);
  var val61 = select(0.0f, data1[(alu4+18928)], alu8);
  var val62 = select(0.0f, data1[(alu4+21632)], alu8);
  var val63 = select(0.0f, data1[(alu4+24336)], alu8);
  var val64 = select(0.0f, data1[(alu4+27040)], alu8);
  var val65 = select(0.0f, data1[(alu4+29744)], alu8);
  var val66 = select(0.0f, data1[(alu4+32448)], alu8);
  var val67 = select(0.0f, data1[(alu4+35152)], alu8);
  var val68 = select(0.0f, data1[(alu4+37856)], alu8);
  var val69 = select(0.0f, data1[(alu4+40560)], alu8);
  var alu9 = (gidx0<1126);
  var alu10 = (gidx0<1127);
  var alu11 = (alu7!=true);
  var alu12 = (alu9!=true);
  var val70 = select(0.0f, data5[(alu1+-3378)], alu12);
  var val71 = select(0.0f, data5[(alu1+-3209)], alu12);
  var val72 = select(0.0f, data5[(alu1+-3040)], alu12);
  var val73 = select(0.0f, data5[(alu1+-2871)], alu12);
  var val74 = select(0.0f, data5[(alu1+-2702)], alu12);
  var val75 = select(0.0f, data5[(alu1+-2533)], alu12);
  var val76 = select(0.0f, data5[(alu1+-2364)], alu12);
  var val77 = select(0.0f, data5[(alu1+-2195)], alu12);
  var val78 = select(0.0f, data5[(alu1+-2026)], alu12);
  var val79 = select(0.0f, data5[(alu1+-1857)], alu12);
  var val80 = select(0.0f, data5[(alu1+-1688)], alu12);
  var val81 = select(0.0f, data5[(alu1+-1519)], alu12);
  var val82 = select(0.0f, data5[(alu1+-1350)], alu12);
  var val83 = select(0.0f, data5[(alu1+-1181)], alu12);
  var val84 = select(0.0f, data5[(alu1+-1012)], alu12);
  var val85 = select(0.0f, data5[(alu1+-843)], alu12);
  var alu13 = (alu10!=true);
  var val86 = select(0.0f, data5[(alu1+-3380)], alu13);
  var val87 = select(0.0f, data5[(alu1+-3379)], alu13);
  var val88 = select(0.0f, data5[(alu1+-3211)], alu13);
  var val89 = select(0.0f, data5[(alu1+-3210)], alu13);
  var val90 = select(0.0f, data5[(alu1+-3042)], alu13);
  var val91 = select(0.0f, data5[(alu1+-3041)], alu13);
  var val92 = select(0.0f, data5[(alu1+-2873)], alu13);
  var val93 = select(0.0f, data5[(alu1+-2872)], alu13);
  var val94 = select(0.0f, data5[(alu1+-2704)], alu13);
  var val95 = select(0.0f, data5[(alu1+-2703)], alu13);
  var val96 = select(0.0f, data5[(alu1+-2535)], alu13);
  var val97 = select(0.0f, data5[(alu1+-2534)], alu13);
  var val98 = select(0.0f, data5[(alu1+-2366)], alu13);
  var val99 = select(0.0f, data5[(alu1+-2365)], alu13);
  var val100 = select(0.0f, data5[(alu1+-2197)], alu13);
  var val101 = select(0.0f, data5[(alu1+-2196)], alu13);
  var val102 = select(0.0f, data5[(alu1+-2028)], alu13);
  var val103 = select(0.0f, data5[(alu1+-2027)], alu13);
  var val104 = select(0.0f, data5[(alu1+-1859)], alu13);
  var val105 = select(0.0f, data5[(alu1+-1858)], alu13);
  var val106 = select(0.0f, data5[(alu1+-1690)], alu13);
  var val107 = select(0.0f, data5[(alu1+-1689)], alu13);
  var val108 = select(0.0f, data5[(alu1+-1521)], alu13);
  var val109 = select(0.0f, data5[(alu1+-1520)], alu13);
  var val110 = select(0.0f, data5[(alu1+-1352)], alu13);
  var val111 = select(0.0f, data5[(alu1+-1351)], alu13);
  var val112 = select(0.0f, data5[(alu1+-1183)], alu13);
  var val113 = select(0.0f, data5[(alu1+-1182)], alu13);
  var val114 = select(0.0f, data5[(alu1+-1014)], alu13);
  var val115 = select(0.0f, data5[(alu1+-1013)], alu13);
  var val116 = select(0.0f, data5[(alu1+-845)], alu13);
  var val117 = select(0.0f, data5[(alu1+-844)], alu13);
  var alu14 = (alu11&alu9);
  var val118 = select(0.0f, data3[(alu3+-2702)], alu14);
  var val119 = select(0.0f, data3[(alu3+-2026)], alu14);
  var val120 = select(0.0f, data3[(alu3+-1350)], alu14);
  var val121 = select(0.0f, data3[(alu3+-674)], alu14);
  var val122 = select(0.0f, data3[(alu3+2)], alu14);
  var val123 = select(0.0f, data3[(alu3+678)], alu14);
  var val124 = select(0.0f, data3[(alu3+1354)], alu14);
  var val125 = select(0.0f, data3[(alu3+2030)], alu14);
  var val126 = select(0.0f, data3[(alu3+2706)], alu14);
  var val127 = select(0.0f, data3[(alu3+3382)], alu14);
  var val128 = select(0.0f, data3[(alu3+4058)], alu14);
  var val129 = select(0.0f, data3[(alu3+4734)], alu14);
  var val130 = select(0.0f, data3[(alu3+5410)], alu14);
  var val131 = select(0.0f, data3[(alu3+6086)], alu14);
  var val132 = select(0.0f, data3[(alu3+6762)], alu14);
  var val133 = select(0.0f, data3[(alu3+7438)], alu14);
  var alu15 = (alu11&alu10);
  var val134 = select(0.0f, data3[(alu3+-2703)], alu15);
  var val135 = select(0.0f, data3[(alu3+-2027)], alu15);
  var val136 = select(0.0f, data3[(alu3+-1351)], alu15);
  var val137 = select(0.0f, data3[(alu3+-675)], alu15);
  var val138 = select(0.0f, data3[(alu3+1)], alu15);
  var val139 = select(0.0f, data3[(alu3+677)], alu15);
  var val140 = select(0.0f, data3[(alu3+1353)], alu15);
  var val141 = select(0.0f, data3[(alu3+2029)], alu15);
  var val142 = select(0.0f, data3[(alu3+2705)], alu15);
  var val143 = select(0.0f, data3[(alu3+3381)], alu15);
  var val144 = select(0.0f, data3[(alu3+4057)], alu15);
  var val145 = select(0.0f, data3[(alu3+4733)], alu15);
  var val146 = select(0.0f, data3[(alu3+5409)], alu15);
  var val147 = select(0.0f, data3[(alu3+6085)], alu15);
  var val148 = select(0.0f, data3[(alu3+6761)], alu15);
  var val149 = select(0.0f, data3[(alu3+7437)], alu15);
  var alu16 = ((alu8!=true)&alu10);
  var val150 = select(0.0f, data3[alu3], alu16);
  var val151 = select(0.0f, data3[(alu3+-2704)], alu16);
  var val152 = select(0.0f, data3[(alu3+-2028)], alu16);
  var val153 = select(0.0f, data3[(alu3+-1352)], alu16);
  var val154 = select(0.0f, data3[(alu3+-676)], alu16);
  var val155 = select(0.0f, data3[(alu3+676)], alu16);
  var val156 = select(0.0f, data3[(alu3+1352)], alu16);
  var val157 = select(0.0f, data3[(alu3+2028)], alu16);
  var val158 = select(0.0f, data3[(alu3+2704)], alu16);
  var val159 = select(0.0f, data3[(alu3+3380)], alu16);
  var val160 = select(0.0f, data3[(alu3+4056)], alu16);
  var val161 = select(0.0f, data3[(alu3+4732)], alu16);
  var val162 = select(0.0f, data3[(alu3+5408)], alu16);
  var val163 = select(0.0f, data3[(alu3+6084)], alu16);
  var val164 = select(0.0f, data3[(alu3+6760)], alu16);
  var val165 = select(0.0f, data3[(alu3+7436)], alu16);
  data0[alu2] = ((exp2((((val54+val151+val86)-val16)*1.4426950408889634f))*val17*val0)+(exp2((((val55+val152+val88)-val16)*1.4426950408889634f))*val17*val1)+(exp2((((val56+val153+val90)-val16)*1.4426950408889634f))*val17*val2)+(exp2((((val57+val154+val92)-val16)*1.4426950408889634f))*val17*val3)+(exp2((((val58+val150+val94)-val16)*1.4426950408889634f))*val17*val4)+(exp2((((val59+val155+val96)-val16)*1.4426950408889634f))*val17*val5)+(exp2((((val60+val156+val98)-val16)*1.4426950408889634f))*val17*val6)+(exp2((((val61+val157+val100)-val16)*1.4426950408889634f))*val17*val7)+(exp2((((val62+val158+val102)-val16)*1.4426950408889634f))*val17*val8)+(exp2((((val63+val159+val104)-val16)*1.4426950408889634f))*val17*val9)+(exp2((((val64+val160+val106)-val16)*1.4426950408889634f))*val17*val10)+(exp2((((val65+val161+val108)-val16)*1.4426950408889634f))*val17*val11)+(exp2((((val66+val162+val110)-val16)*1.4426950408889634f))*val17*val12)+(exp2((((val67+val163+val112)-val16)*1.4426950408889634f))*val17*val13)+(exp2((((val68+val164+val114)-val16)*1.4426950408889634f))*val17*val14)+(exp2((((val69+val165+val116)-val16)*1.4426950408889634f))*val17*val15));
  data0[alu5] = ((exp2((((val22+val134+val87)-val18)*1.4426950408889634f))*val19*val0)+(exp2((((val24+val135+val89)-val18)*1.4426950408889634f))*val19*val1)+(exp2((((val26+val136+val91)-val18)*1.4426950408889634f))*val19*val2)+(exp2((((val28+val137+val93)-val18)*1.4426950408889634f))*val19*val3)+(exp2((((val30+val138+val95)-val18)*1.4426950408889634f))*val19*val4)+(exp2((((val32+val139+val97)-val18)*1.4426950408889634f))*val19*val5)+(exp2((((val34+val140+val99)-val18)*1.4426950408889634f))*val19*val6)+(exp2((((val36+val141+val101)-val18)*1.4426950408889634f))*val19*val7)+(exp2((((val38+val142+val103)-val18)*1.4426950408889634f))*val19*val8)+(exp2((((val40+val143+val105)-val18)*1.4426950408889634f))*val19*val9)+(exp2((((val42+val144+val107)-val18)*1.4426950408889634f))*val19*val10)+(exp2((((val44+val145+val109)-val18)*1.4426950408889634f))*val19*val11)+(exp2((((val46+val146+val111)-val18)*1.4426950408889634f))*val19*val12)+(exp2((((val48+val147+val113)-val18)*1.4426950408889634f))*val19*val13)+(exp2((((val50+val148+val115)-val18)*1.4426950408889634f))*val19*val14)+(exp2((((val52+val149+val117)-val18)*1.4426950408889634f))*val19*val15));
  data0[alu6] = ((exp2((((val23+val118+val70)-val20)*1.4426950408889634f))*val21*val0)+(exp2((((val25+val119+val71)-val20)*1.4426950408889634f))*val21*val1)+(exp2((((val27+val120+val72)-val20)*1.4426950408889634f))*val21*val2)+(exp2((((val29+val121+val73)-val20)*1.4426950408889634f))*val21*val3)+(exp2((((val31+val122+val74)-val20)*1.4426950408889634f))*val21*val4)+(exp2((((val33+val123+val75)-val20)*1.4426950408889634f))*val21*val5)+(exp2((((val35+val124+val76)-val20)*1.4426950408889634f))*val21*val6)+(exp2((((val37+val125+val77)-val20)*1.4426950408889634f))*val21*val7)+(exp2((((val39+val126+val78)-val20)*1.4426950408889634f))*val21*val8)+(exp2((((val41+val127+val79)-val20)*1.4426950408889634f))*val21*val9)+(exp2((((val43+val128+val80)-val20)*1.4426950408889634f))*val21*val10)+(exp2((((val45+val129+val81)-val20)*1.4426950408889634f))*val21*val11)+(exp2((((val47+val130+val82)-val20)*1.4426950408889634f))*val21*val12)+(exp2((((val49+val131+val83)-val20)*1.4426950408889634f))*val21*val13)+(exp2((((val51+val132+val84)-val20)*1.4426950408889634f))*val21*val14)+(exp2((((val53+val133+val85)-val20)*1.4426950408889634f))*val21*val15));
}`;

const E_1183_3_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var lidx0 = i32(lindex.x); /* 3 */
  var alu0 = (lidx0+(gidx0*3));
  var val0 = data4[alu0];
  var alu1 = (alu0*2521);
  var alu2 = (alu0+3549);
  var val1 = data4[alu2];
  var val2 = data4[(alu0+7098)];
  var val3 = data4[(alu0+10647)];
  var alu3 = (alu0<2704);
  var val4 = select(0.0f, data1[(alu1>>17)], alu3);
  var val5 = select(0.0f, data1[(alu0%52)], alu3);
  var alu4 = (alu0<3380);
  var alu5 = (alu4!=true);
  var val6 = select(0.0f, data3[((alu1>>15)+-260)], alu5);
  var val7 = select(0.0f, data3[(alu0%13)], alu5);
  var alu6 = ((alu3!=true)&alu4);
  var val8 = select(0.0f, data2[((alu1>>16)+-104)], alu6);
  var val9 = select(0.0f, data2[(alu0%26)], alu6);
  var alu7 = (val4+val8+val6);
  var alu8 = (val5+val9+val7);
  data0[alu2] = (((alu7-val1)+alu7+val3)*0.5f);
  data0[alu0] = (((alu8-val0)+alu8+val2)*0.5f);
}`;

const E_1183_3_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var lidx0 = i32(lindex.x); /* 3 */
  var alu0 = (lidx0+(gidx0*3));
  var val0 = data4[alu0];
  var alu1 = (alu0*2521);
  var alu2 = (alu0+3549);
  var val1 = data4[alu2];
  var val2 = data4[(alu0+7098)];
  var val3 = data4[(alu0+10647)];
  var alu3 = (alu0<2704);
  var val4 = select(0.0f, data1[(alu1>>17)], alu3);
  var val5 = select(0.0f, data1[(alu0%52)], alu3);
  var alu4 = (alu0<3380);
  var alu5 = (alu4!=true);
  var val6 = select(0.0f, data3[((alu1>>15)+-260)], alu5);
  var val7 = select(0.0f, data3[(alu0%13)], alu5);
  var alu6 = ((alu3!=true)&alu4);
  var val8 = select(0.0f, data2[((alu1>>16)+-104)], alu6);
  var val9 = select(0.0f, data2[(alu0%26)], alu6);
  data0[alu2] = (val4+val8+val6+val3+((-val4-val8)-val6)+val1);
  data0[alu0] = (val5+val9+val7+val2+((-val5-val9)-val7)+val0);
}`;

const E_1183_3n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var val0 = data1[alu0];
  var val1 = data2[alu0];
  var val2 = data3[alu0];
  var alu1 = (alu0+1);
  var val3 = data1[alu1];
  var val4 = data2[alu1];
  var val5 = data3[alu1];
  var alu2 = (alu0+2);
  var val6 = data1[alu2];
  var val7 = data2[alu2];
  var val8 = data3[alu2];
  data0[alu0] = ((val0*val2)+(val1*val2*-0.5f));
  data0[alu1] = ((val3*val5)+(val4*val5*-0.5f));
  data0[alu2] = ((val6*val8)+(val7*val8*-0.5f));
}`;

const E_1183_3n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var val0 = data3[alu0];
  var alu1 = (alu0+1);
  var val1 = data3[alu1];
  var alu2 = (alu0+2);
  var val2 = data3[alu2];
  var alu3 = (alu0+3549);
  var val3 = data1[alu3];
  var val4 = data2[alu3];
  var alu4 = (alu0+3550);
  var val5 = data1[alu4];
  var val6 = data2[alu4];
  var alu5 = (alu0+3551);
  var val7 = data1[alu5];
  var val8 = data2[alu5];
  data0[alu0] = ((val3*val0)+(val4*val0*-0.5f));
  data0[alu1] = ((val5*val1)+(val6*val1*-0.5f));
  data0[alu2] = ((val7*val2)+(val8*val2*-0.5f));
}`;

const E_1183_3n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var val0 = data1[alu0];
  var val1 = data2[alu0];
  var val2 = data3[alu0];
  var alu1 = (alu0+1);
  var val3 = data1[alu1];
  var val4 = data2[alu1];
  var val5 = data3[alu1];
  var alu2 = (alu0+2);
  var val6 = data1[alu2];
  var val7 = data2[alu2];
  var val8 = data3[alu2];
  data0[alu0] = ((val0*val2)+(val1*val2*0.5f));
  data0[alu1] = ((val3*val5)+(val4*val5*0.5f));
  data0[alu2] = ((val6*val8)+(val7*val8*0.5f));
}`;

const E_1183_3n4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var val0 = data3[alu0];
  var alu1 = (alu0+1);
  var val1 = data3[alu1];
  var alu2 = (alu0+2);
  var val2 = data3[alu2];
  var alu3 = (alu0+3549);
  var val3 = data1[alu3];
  var val4 = data2[alu3];
  var alu4 = (alu0+3550);
  var val5 = data1[alu4];
  var val6 = data2[alu4];
  var alu5 = (alu0+3551);
  var val7 = data1[alu5];
  var val8 = data2[alu5];
  data0[alu0] = ((val3*val0)+(val4*val0*0.5f));
  data0[alu1] = ((val5*val1)+(val6*val1*0.5f));
  data0[alu2] = ((val7*val2)+(val8*val2*0.5f));
}`;

const r_1183_20_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var acc0 = (f32(-INFINITY));
  var acc1 = (f32(-INFINITY));
  var acc2 = (f32(-INFINITY));
  for (var ridx1 = 0; ridx1 < 20; ridx1++) {
    var alu1 = (alu0+(ridx1*14196));
    var val0 = data4[alu1];
    var val1 = data4[(alu1+1)];
    var val2 = data4[(alu1+2)];
    var val3 = data4[(alu1+3549)];
    var val4 = data4[(alu1+3550)];
    var val5 = data4[(alu1+3551)];
    var val6 = data4[(alu1+7098)];
    var val7 = data4[(alu1+7099)];
    var val8 = data4[(alu1+7100)];
    var val9 = data4[(alu1+10647)];
    var val10 = data4[(alu1+10648)];
    var val11 = data4[(alu1+10649)];
    var alu2 = select(acc0,val0,(acc0<val0));
    var alu3 = select(acc1,val1,(acc1<val1));
    var alu4 = select(acc2,val2,(acc2<val2));
    var alu5 = select(alu2,val3,(alu2<val3));
    var alu6 = select(alu3,val4,(alu3<val4));
    var alu7 = select(alu4,val5,(alu4<val5));
    var alu8 = select(alu5,val6,(alu5<val6));
    var alu9 = select(alu6,val7,(alu6<val7));
    var alu10 = select(alu7,val8,(alu7<val8));
    acc0 = select(alu8,val9,(alu8<val9));
    acc1 = select(alu9,val10,(alu9<val10));
    acc2 = select(alu10,val11,(alu10<val11));
  }
  data0[alu0] = acc0;
  data0[(alu0+1)] = acc1;
  data0[(alu0+2)] = acc2;
}`;

const E_1183_3n5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  data0[alu0] = select(val0,0.0f,(val0<0.25f));
  data0[alu1] = select(val1,0.0f,(val1<0.25f));
  data0[alu2] = select(val2,0.0f,(val2<0.25f));
}`;

const r_1183_20_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data4:array<f32>;
@group(0) @binding(3)var<storage,read_write>data5:array<f32>;
@group(0) @binding(4)var<storage,read_write>data6:array<i32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var val0 = data5[alu0];
  var val1 = data5[alu1];
  var val2 = data5[alu2];
  var acc0 = -2147483648;
  var acc1 = -2147483648;
  var acc2 = -2147483648;
  for (var ridx1 = 0; ridx1 < 20; ridx1++) {
    var precast0 = ridx1;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var val3 = data6[cast0];
    var val4 = data6[(cast0+1)];
    var val5 = data6[(cast0+2)];
    var val6 = data6[(cast0+3)];
    var alu3 = (alu0+(ridx1*14196));
    var val7 = data4[alu3];
    var val8 = data4[(alu3+1)];
    var val9 = data4[(alu3+2)];
    var val10 = data4[(alu3+3549)];
    var val11 = data4[(alu3+3550)];
    var val12 = data4[(alu3+3551)];
    var val13 = data4[(alu3+7098)];
    var val14 = data4[(alu3+7099)];
    var val15 = data4[(alu3+7100)];
    var val16 = data4[(alu3+10647)];
    var val17 = data4[(alu3+10648)];
    var val18 = data4[(alu3+10649)];
    var alu4 = ((i32(((val7!=val0)!=true)))*val3);
    var alu5 = ((i32(((val8!=val1)!=true)))*val3);
    var alu6 = ((i32(((val9!=val2)!=true)))*val3);
    var alu7 = ((i32(((val10!=val0)!=true)))*val4);
    var alu8 = ((i32(((val11!=val1)!=true)))*val4);
    var alu9 = ((i32(((val12!=val2)!=true)))*val4);
    var alu10 = ((i32(((val13!=val0)!=true)))*val5);
    var alu11 = ((i32(((val14!=val1)!=true)))*val5);
    var alu12 = ((i32(((val15!=val2)!=true)))*val5);
    var alu13 = ((i32(((val16!=val0)!=true)))*val6);
    var alu14 = ((i32(((val17!=val1)!=true)))*val6);
    var alu15 = ((i32(((val18!=val2)!=true)))*val6);
    var alu16 = select(acc0,alu4,(acc0<alu4));
    var alu17 = select(acc1,alu5,(acc1<alu5));
    var alu18 = select(acc2,alu6,(acc2<alu6));
    var alu19 = select(alu7,alu16,(alu7<alu16));
    var alu20 = select(alu8,alu17,(alu8<alu17));
    var alu21 = select(alu9,alu18,(alu9<alu18));
    var alu22 = select(alu10,alu19,(alu10<alu19));
    var alu23 = select(alu11,alu20,(alu11<alu20));
    var alu24 = select(alu12,alu21,(alu12<alu21));
    acc0 = select(alu13,alu22,(alu13<alu22));
    acc1 = select(alu14,alu23,(alu14<alu23));
    acc2 = select(alu15,alu24,(alu15<alu24));
  }
  data0[alu0] = (f32((80-acc0)));
  data0[alu1] = (f32((80-acc1)));
  data0[alu2] = (f32((80-acc2)));
}`;

const E_2_2_2_2_2_2_2_2_2_2_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(2,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 2 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx1;
  var precast1 = gidx2;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<5u);
  var precast4 = (bitcast<u32>(precast1)<<6u);
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var precast6 = (gidx0>>1);
  var precast7 = (bitcast<u32>(precast6)<<4u);
  var alu0 = (lidx1<1);
  var alu1 = (alu0!=true);
  var precast8 = (gidx0&1);
  var precast9 = (bitcast<u32>(precast8)<<3u);
  var alu2 = (bitcast<i32>(precast5)+bitcast<i32>(precast9)+bitcast<i32>(precast7)+bitcast<i32>(precast3)+bitcast<i32>(precast4));
  var alu3 = (lidx2+alu2);
  var val0 = select(0.0f, data1[alu3], alu0);
  var val1 = select(0.0f, data1[(alu3+128)], alu0);
  var val2 = select(0.0f, data1[(alu3+256)], alu0);
  var val3 = select(0.0f, data1[(alu3+384)], alu0);
  var val4 = select(0.0f, data1[(alu3+512)], alu0);
  var val5 = select(0.0f, data1[(alu3+640)], alu0);
  var val6 = select(0.0f, data1[(alu3+768)], alu0);
  var val7 = select(0.0f, data1[(alu3+896)], alu0);
  var val8 = select(0.0f, data1[(alu3+1024)], alu0);
  var val9 = select(0.0f, data1[(alu3+1152)], alu0);
  var val10 = select(0.0f, data1[(alu3+1280)], alu0);
  var val11 = select(0.0f, data1[(alu3+1408)], alu0);
  var val12 = select(0.0f, data1[(alu3+1536)], alu0);
  var val13 = select(0.0f, data1[(alu3+1664)], alu0);
  var val14 = select(0.0f, data1[(alu3+1792)], alu0);
  var val15 = select(0.0f, data1[(alu3+1920)], alu0);
  var val16 = select(0.0f, data1[(alu3+2048)], alu0);
  var val17 = select(0.0f, data1[(alu3+2176)], alu0);
  var val18 = select(0.0f, data1[(alu3+2304)], alu0);
  var val19 = select(0.0f, data1[(alu3+2432)], alu0);
  var val20 = select(0.0f, data1[(alu3+2560)], alu0);
  var val21 = select(0.0f, data1[(alu3+2688)], alu0);
  var val22 = select(0.0f, data1[(alu3+2816)], alu0);
  var val23 = select(0.0f, data1[(alu3+2944)], alu0);
  var val24 = select(0.0f, data1[(alu3+3072)], alu0);
  var val25 = select(0.0f, data1[(alu3+3200)], alu0);
  var val26 = select(0.0f, data1[(alu3+3328)], alu0);
  var alu4 = (alu0&(alu3<93));
  var val27 = select(0.0f, data1[(alu3+3456)], alu4);
  var alu5 = (alu2-lidx2);
  var val28 = select(0.0f, data1[(alu5+3)], alu1);
  var val29 = select(0.0f, data1[(alu5+131)], alu1);
  var val30 = select(0.0f, data1[(alu5+259)], alu1);
  var val31 = select(0.0f, data1[(alu5+387)], alu1);
  var val32 = select(0.0f, data1[(alu5+515)], alu1);
  var val33 = select(0.0f, data1[(alu5+643)], alu1);
  var val34 = select(0.0f, data1[(alu5+771)], alu1);
  var val35 = select(0.0f, data1[(alu5+899)], alu1);
  var val36 = select(0.0f, data1[(alu5+1027)], alu1);
  var val37 = select(0.0f, data1[(alu5+1155)], alu1);
  var val38 = select(0.0f, data1[(alu5+1283)], alu1);
  var val39 = select(0.0f, data1[(alu5+1411)], alu1);
  var val40 = select(0.0f, data1[(alu5+1539)], alu1);
  var val41 = select(0.0f, data1[(alu5+1667)], alu1);
  var val42 = select(0.0f, data1[(alu5+1795)], alu1);
  var val43 = select(0.0f, data1[(alu5+1923)], alu1);
  var val44 = select(0.0f, data1[(alu5+2051)], alu1);
  var val45 = select(0.0f, data1[(alu5+2179)], alu1);
  var val46 = select(0.0f, data1[(alu5+2307)], alu1);
  var val47 = select(0.0f, data1[(alu5+2435)], alu1);
  var val48 = select(0.0f, data1[(alu5+2563)], alu1);
  var val49 = select(0.0f, data1[(alu5+2691)], alu1);
  var val50 = select(0.0f, data1[(alu5+2819)], alu1);
  var val51 = select(0.0f, data1[(alu5+2947)], alu1);
  var val52 = select(0.0f, data1[(alu5+3075)], alu1);
  var val53 = select(0.0f, data1[(alu5+3203)], alu1);
  var val54 = select(0.0f, data1[(alu5+3331)], alu1);
  var alu6 = (alu1&(alu5<90));
  var val55 = select(0.0f, data1[(alu5+3459)], alu6);
  var precast10 = lidx1;
  var precast11 = (bitcast<u32>(precast10)<<1u);
  var alu7 = (lidx2+bitcast<i32>(precast11)+alu2);
  data0[(alu7+3584)] = (f32(-INFINITY));
  data0[(alu7+3712)] = (f32(-INFINITY));
  data0[(alu7+3840)] = (f32(-INFINITY));
  data0[(alu7+3968)] = (f32(-INFINITY));
  var alu12 = select(0.0f,(f32(-INFINITY)),alu0);
  var alu13 = select(alu12,0.0f,alu0);
  var alu14 = select((f32(-INFINITY)),0.0f,alu0);
  var alu15 = select(0.0f,alu14,alu0);
  data0[alu7] = (val0+alu13+val28+alu15);
  data0[(alu7+128)] = (val1+alu13+val29+alu15);
  data0[(alu7+256)] = (val2+alu13+val30+alu15);
  data0[(alu7+384)] = (val3+alu13+val31+alu15);
  data0[(alu7+512)] = (val4+alu13+val32+alu15);
  data0[(alu7+640)] = (val5+alu13+val33+alu15);
  data0[(alu7+768)] = (val6+alu13+val34+alu15);
  data0[(alu7+896)] = (val7+alu13+val35+alu15);
  data0[(alu7+1024)] = (val8+alu13+val36+alu15);
  data0[(alu7+1152)] = (val9+alu13+val37+alu15);
  data0[(alu7+1280)] = (val10+alu13+val38+alu15);
  data0[(alu7+1408)] = (val11+alu13+val39+alu15);
  data0[(alu7+1536)] = (val12+alu13+val40+alu15);
  data0[(alu7+1664)] = (val13+alu13+val41+alu15);
  data0[(alu7+1792)] = (val14+alu13+val42+alu15);
  data0[(alu7+1920)] = (val15+alu13+val43+alu15);
  data0[(alu7+2048)] = (val16+alu13+val44+alu15);
  data0[(alu7+2176)] = (val17+alu13+val45+alu15);
  data0[(alu7+2304)] = (val18+alu13+val46+alu15);
  data0[(alu7+2432)] = (val19+alu13+val47+alu15);
  data0[(alu7+2560)] = (val20+alu13+val48+alu15);
  data0[(alu7+2688)] = (val21+alu13+val49+alu15);
  data0[(alu7+2816)] = (val22+alu13+val50+alu15);
  data0[(alu7+2944)] = (val23+alu13+val51+alu15);
  data0[(alu7+3072)] = (val24+alu13+val52+alu15);
  data0[(alu7+3200)] = (val25+alu13+val53+alu15);
  data0[(alu7+3328)] = (val26+alu13+val54+alu15);
  data0[(alu7+3456)] = (val27+select(alu12,0.0f,alu4)+val55+select(alu14,0.0f,alu6));
}`;

const r_1183_3549_3n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var val0 = data1[alu0];
  var val1 = data1[alu1];
  var val2 = data1[alu2];
  var val3 = data2[alu0];
  var val4 = data2[alu1];
  var val5 = data2[alu2];
  var acc0 = 0;
  var acc1 = 0;
  var acc2 = 0;
  for (var ridx1 = 0; ridx1 < 3549; ridx1++) {
    var val6 = data1[ridx1];
    var val7 = data2[ridx1];
    acc0 = (acc0+(i32((((val0<val6)!=true)&((val7!=val3)!=true)))));
    acc1 = (acc1+(i32((((val1<val6)!=true)&((val7!=val4)!=true)))));
    acc2 = (acc2+(i32((((val2<val6)!=true)&((val7!=val5)!=true)))));
  }
  data0[alu0] = acc0;
  data0[alu1] = acc1;
  data0[alu2] = acc2;
}`;

const E_1183_3_6 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var lidx0 = i32(lindex.x); /* 3 */
  var alu0 = (lidx0+(gidx0*3));
  var val0 = data1[alu0];
  var val1 = data2[alu0];
  var val2 = data3[alu0];
  var val3 = data4[alu0];
  var val4 = data5[alu0];
  var val5 = data6[alu0];
  var alu1 = ((gidx0*18)+(lidx0*6));
  data0[alu1] = val0;
  data0[(alu1+1)] = val1;
  data0[(alu1+2)] = val2;
  data0[(alu1+3)] = val3;
  data0[(alu1+4)] = val4;
  data0[(alu1+5)] = val5;
}`;

const E_64_32_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<6u);
  var precast3 = (bitcast<u32>(precast1)<<1u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_16_32_2_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<3u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+6);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+3)];
  var val3 = data1[(alu3+5)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+2)] = val2;
  data0[(alu1+4)] = val1;
}`;

const E_32_32_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+2);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_8_32_4_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<9u);
  var precast3 = (bitcast<u32>(precast1)<<4u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+12);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+7)];
  var val3 = data1[(alu3+11)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+4)] = val2;
  data0[(alu1+8)] = val1;
}`;

const E_16_32_4_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<3u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+4);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_8_16_8_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<9u);
  var precast3 = (bitcast<u32>(precast1)<<5u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+24);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+15)];
  var val3 = data1[(alu3+23)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+8)] = val2;
  data0[(alu1+16)] = val1;
}`;

const E_16_16_8_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<4u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+8);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_8_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<9u);
  var precast3 = (bitcast<u32>(precast1)<<6u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+48);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+31)];
  var val3 = data1[(alu3+47)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+16)] = val2;
  data0[(alu1+32)] = val1;
}`;

const E_16_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<5u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+16);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_4_2_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<10u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<7u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+cast1+bitcast<i32>(precast3)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+96);
  var val1 = data1[alu1];
  var alu2 = ((cast1+(gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+63)];
  var val3 = data1[(alu2+95)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+32)] = val2;
  data0[(alu0+64)] = val1;
}`;

const E_8_2_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<9u);
  var precast5 = (bitcast<u32>(precast2)<<6u);
  var alu0 = (lidx1+bitcast<i32>(precast5)+bitcast<i32>(precast3)+bitcast<i32>(precast4));
  var val0 = data1[alu0];
  var alu1 = (alu0+32);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_2_4_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<11u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<8u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+cast1+bitcast<i32>(precast3)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+192);
  var val1 = data1[alu1];
  var alu2 = ((cast1+(gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+127)];
  var val3 = data1[(alu2+191)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+64)] = val2;
  data0[(alu0+128)] = val1;
}`;

const E_4_4_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<10u);
  var precast5 = (bitcast<u32>(precast2)<<7u);
  var alu0 = (lidx1+bitcast<i32>(precast5)+bitcast<i32>(precast3)+bitcast<i32>(precast4));
  var val0 = data1[alu0];
  var alu1 = (alu0+64);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_8_8_16_2_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<9u);
  var cast0 = bitcast<i32>(precast3);
  var alu0 = (lidx1+bitcast<i32>(precast2)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+384);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+255)];
  var val3 = data1[(alu2+383)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+128)] = val2;
  data0[(alu0+256)] = val1;
}`;

const E_2_8_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<11u);
  var precast5 = (bitcast<u32>(precast2)<<8u);
  var alu0 = (lidx1+bitcast<i32>(precast5)+bitcast<i32>(precast3)+bitcast<i32>(precast4));
  var val0 = data1[alu0];
  var alu1 = (alu0+128);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_16_4_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<10u);
  var cast0 = bitcast<i32>(precast3);
  var alu0 = (lidx1+bitcast<i32>(precast2)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+768);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+511)];
  var val3 = data1[(alu2+767)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+256)] = val2;
  data0[(alu0+512)] = val1;
}`;

const E_16_8_16_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<9u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+256);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_32_2_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(2,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<11u);
  var cast0 = bitcast<i32>(precast3);
  var alu0 = (lidx1+bitcast<i32>(precast2)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+1536);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+1023)];
  var val3 = data1[(alu2+1535)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+512)] = val2;
  data0[(alu0+1024)] = val1;
}`;

const E_32_4_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<10u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+512);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_32_32_2_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<5u);
  var alu0 = (lidx0+bitcast<i32>(precast1));
  var val0 = data1[alu0];
  var alu1 = (alu0+3072);
  var val1 = data1[alu1];
  var alu2 = ((gidx0*-32)-lidx0);
  var val2 = data1[(alu2+2047)];
  var val3 = data1[(alu2+3071)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+1024)] = val2;
  data0[(alu0+2048)] = val1;
}`;

const E_64_2_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(2,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<11u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1024);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  data0[alu1] = -select(alu2,alu3,(alu2<alu3));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const E_64_32_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<5u);
  var alu0 = (lidx0+bitcast<i32>(precast1));
  var val0 = data1[alu0];
  var val1 = data1[(((gidx0*-32)-lidx0)+4095)];
  var alu1 = -val0;
  var alu2 = -val1;
  data0[(alu0+2048)] = -select(alu1,alu2,(alu1<alu2));
  data0[alu0] = select(val0,val1,(val0<val1));
}`;

const r_1183_3549_3n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var val0 = data1[alu0];
  var val1 = data1[alu1];
  var val2 = data1[alu2];
  var val3 = data2[alu0];
  var val4 = data2[alu1];
  var val5 = data2[alu2];
  var acc0 = 0;
  var acc1 = 0;
  var acc2 = 0;
  for (var ridx1 = 0; ridx1 < 3549; ridx1++) {
    var val6 = data1[ridx1];
    var val7 = data2[ridx1];
    acc0 = (acc0+(i32((((val0<val6)!=true)&((val7!=val3)!=true)))));
    acc1 = (acc1+(i32((((val1<val6)!=true)&((val7!=val4)!=true)))));
    acc2 = (acc2+(i32((((val2<val6)!=true)&((val7!=val5)!=true)))));
  }
  data0[alu0] = acc0;
  data0[alu1] = acc1;
  data0[alu2] = acc2;
}`;

const r_1183_3549_3n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<i32>;
@group(0) @binding(5)var<storage,read_write>data4:array<i32>;
@group(0) @binding(6)var<storage,read_write>data5:array<i32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1183 */
  var alu0 = (gidx0*3);
  var alu1 = (alu0+1);
  var alu2 = (alu0+2);
  var val0 = data4[alu0];
  var val1 = data4[alu1];
  var val2 = data4[alu2];
  var val3 = data2[alu0];
  var val4 = data2[alu1];
  var val5 = data2[alu2];
  var acc0 = 0;
  var acc1 = 0;
  var acc2 = 0;
  for (var ridx1 = 0; ridx1 < 3549; ridx1++) {
    var val6 = data3[ridx1];
    var val7 = data5[ridx1];
    var val8 = data1[ridx1];
    acc0 = (acc0+((i32((((val8!=val3)!=true)&((val6!=val0)!=true))))*val7));
    acc1 = (acc1+((i32((((val8!=val4)!=true)&((val6!=val1)!=true))))*val7));
    acc2 = (acc2+((i32((((val8!=val5)!=true)&((val6!=val2)!=true))))*val7));
  }
  data0[alu0] = acc0;
  data0[alu1] = acc1;
  data0[alu2] = acc2;
}`;

const E_25_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 25 */
  var lidx0 = i32(lindex.x); /* 3 */
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var alu0 = ((gidx0*12)+bitcast<i32>(precast1));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var alu3 = (alu0+3);
  var val3 = data1[alu3];
  data0[alu0] = select(val0,(val0+3549),(val0<0));
  data0[alu1] = select(val1,(val1+3549),(val1<0));
  data0[alu2] = select(val2,(val2+3549),(val2<0));
  data0[alu3] = select(val3,(val3+3549),(val3<0));
}`;

const r_75_4_2_3549_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<i32>;
@group(0) @binding(4)var<storage,read_write>data3:array<i32>;
@compute @workgroup_size(4,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 75 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 2 */
  var alu0 = (lidx1*3);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var val0 = data2[(lidx0+bitcast<i32>(precast1))];
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  for (var ridx3 = 0; ridx3 < 3549; ridx3++) {
    var val1 = data3[ridx3];
    var alu1 = (alu0+(ridx3*6));
    var val2 = data1[alu1];
    var val3 = data1[(alu1+1)];
    var val4 = data1[(alu1+2)];
    var cast0 = (f32(((val0!=val1)!=true)));
    acc0 = (acc0+(val2*cast0));
    acc1 = (acc1+(val3*cast0));
    acc2 = (acc2+(val4*cast0));
  }
  var alu6 = (alu0+(gidx0*24)+(lidx0*6));
  data0[alu6] = acc0;
  data0[(alu6+1)] = acc1;
  data0[(alu6+2)] = acc2;
}`;

const E_25_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 25 */
  var lidx0 = i32(lindex.x); /* 3 */
  var alu0 = ((gidx0*72)+(lidx0*24));
  var val0 = data1[alu0];
  var val1 = data1[(alu0+1)];
  var val2 = data1[(alu0+2)];
  var val3 = data1[(alu0+3)];
  var val4 = data1[(alu0+6)];
  var val5 = data1[(alu0+7)];
  var val6 = data1[(alu0+8)];
  var val7 = data1[(alu0+9)];
  var val8 = data1[(alu0+12)];
  var val9 = data1[(alu0+13)];
  var val10 = data1[(alu0+14)];
  var val11 = data1[(alu0+15)];
  var val12 = data1[(alu0+18)];
  var val13 = data1[(alu0+19)];
  var val14 = data1[(alu0+20)];
  var val15 = data1[(alu0+21)];
  var precast0 = lidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var alu1 = ((gidx0*12)+bitcast<i32>(precast1));
  data0[alu1] = ((val2-val0)*(val3-val1));
  data0[(alu1+1)] = ((val6-val4)*(val7-val5));
  data0[(alu1+2)] = ((val10-val8)*(val11-val9));
  data0[(alu1+3)] = ((val14-val12)*(val15-val13));
}`;

const r_75_4_75_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 75 */
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var alu0 = (lidx0+cast0);
  var val0 = data2[alu0];
  var alu1 = ((gidx0*24)+(lidx0*6));
  var val1 = data1[alu1];
  var val2 = data1[(alu1+1)];
  var val3 = data1[(alu1+2)];
  var val4 = data1[(alu1+3)];
  var val5 = data1[(alu1+5)];
  var alu2 = -val3;
  var alu3 = -val4;
  var acc0 = 0;
  for (var ridx2 = 0; ridx2 < 75; ridx2++) {
    var precast2 = ridx2;
    var alu4 = (ridx2*24);
    var val6 = data1[alu4];
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var cast1 = bitcast<i32>(precast3);
    var val7 = data2[cast1];
    var val8 = data2[(cast1+1)];
    var val9 = data2[(cast1+2)];
    var val10 = data2[(cast1+3)];
    var val11 = data1[(alu4+1)];
    var val12 = data1[(alu4+2)];
    var val13 = data1[(alu4+3)];
    var val14 = data1[(alu4+5)];
    var val15 = data1[(alu4+6)];
    var val16 = data1[(alu4+7)];
    var val17 = data1[(alu4+8)];
    var val18 = data1[(alu4+9)];
    var val19 = data1[(alu4+11)];
    var val20 = data1[(alu4+12)];
    var val21 = data1[(alu4+13)];
    var val22 = data1[(alu4+14)];
    var val23 = data1[(alu4+15)];
    var val24 = data1[(alu4+17)];
    var val25 = data1[(alu4+18)];
    var val26 = data1[(alu4+19)];
    var val27 = data1[(alu4+20)];
    var val28 = data1[(alu4+21)];
    var val29 = data1[(alu4+23)];
    var alu5 = -val12;
    var alu6 = -val13;
    var alu7 = -val17;
    var alu8 = -val18;
    var alu9 = -val22;
    var alu10 = -val23;
    var alu11 = -val27;
    var alu12 = -val28;
    var alu13 = (ridx2*1194);
    var alu14 = (alu13+alu0);
    var alu15 = (-select(alu5,alu2,(alu5<alu2))-select(val6,val1,(val6<val1)));
    var alu16 = (-select(alu6,alu3,(alu6<alu3))-select(val11,val2,(val11<val2)));
    var alu17 = (-select(alu7,alu2,(alu7<alu2))-select(val15,val1,(val15<val1)));
    var alu18 = (-select(alu8,alu3,(alu8<alu3))-select(val16,val2,(val16<val2)));
    var alu19 = (-select(alu9,alu2,(alu9<alu2))-select(val20,val1,(val20<val1)));
    var alu20 = (-select(alu10,alu3,(alu10<alu3))-select(val21,val2,(val21<val2)));
    var alu21 = (-select(alu11,alu2,(alu11<alu2))-select(val25,val1,(val25<val1)));
    var alu22 = (-select(alu12,alu3,(alu12<alu3))-select(val26,val2,(val26<val2)));
    var alu23 = (select(0.0f,alu15,(0.0f<alu15))*select(0.0f,alu16,(0.0f<alu16)));
    var alu24 = (select(0.0f,alu17,(0.0f<alu17))*select(0.0f,alu18,(0.0f<alu18)));
    var alu25 = (select(0.0f,alu19,(0.0f<alu19))*select(0.0f,alu20,(0.0f<alu20)));
    var alu26 = (select(0.0f,alu21,(0.0f<alu21))*select(0.0f,alu22,(0.0f<alu22)));
    acc0 = ((i32(((0.45f<select(0.0f,(alu26*(1/((val10+val0)-alu26))),(((alu14+1194)%1198)<599)))&((val29!=val5)!=true))))+(i32(((0.45f<select(0.0f,(alu25*(1/((val9+val0)-alu25))),(((alu14+1195)%1198)<599)))&((val24!=val5)!=true))))+(i32(((0.45f<select(0.0f,(alu24*(1/((val8+val0)-alu24))),(((alu14+1196)%1198)<599)))&((val19!=val5)!=true))))+acc0+(i32(((0.45f<select(0.0f,(alu23*(1/((val7+val0)-alu23))),(((cast0+lidx0+alu13+1197)%1198)<599)))&((val14!=val5)!=true)))));
  }
  data0[alu0] = (f32(((bool(acc0))!=true)));
}`;

const E_75_4_2_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(4,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 75 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 2 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var val0 = data2[(lidx0+bitcast<i32>(precast1))];
  var alu0 = ((lidx1*3)+(gidx0*24)+(lidx0*6));
  var val1 = data1[alu0];
  var alu1 = (alu0+1);
  var val2 = data1[alu1];
  var alu2 = (alu0+2);
  var val3 = data1[alu2];
  data0[alu0] = (val1*val0);
  data0[alu1] = (val2*val0);
  data0[alu2] = (val3*val0);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 208);;
    const buf_1 = createEmptyBuf(device, 104);;
    const buf_2 = createEmptyBuf(device, 52);;
    const buf_3 = createEmptyBuf(device, 1728);;
    const buf_4 = createWeightBuf(device, 864, getTensorBuffer(safetensor, metadata['net.b1.0.conv.weight']));
    const buf_5 = createEmptyBuf(device, 64);;
    const buf_6 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b1.0.bn.running_mean']));
    const buf_7 = createEmptyBuf(device, 64);;
    const buf_8 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b1.0.bn.weight']));
    const buf_9 = createEmptyBuf(device, 64);;
    const buf_10 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b1.0.bn.bias']));
    const buf_11 = createEmptyBuf(device, 18432);;
    const buf_12 = createWeightBuf(device, 9216, getTensorBuffer(safetensor, metadata['net.b1.1.conv.weight']));
    const buf_13 = createEmptyBuf(device, 128);;
    const buf_14 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b1.1.bn.running_mean']));
    const buf_15 = createEmptyBuf(device, 128);;
    const buf_16 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b1.1.bn.weight']));
    const buf_17 = createEmptyBuf(device, 128);;
    const buf_18 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b1.1.bn.bias']));
    const buf_19 = createEmptyBuf(device, 4096);;
    const buf_20 = createWeightBuf(device, 2048, getTensorBuffer(safetensor, metadata['net.b2.0.cv1.conv.weight']));
    const buf_21 = createEmptyBuf(device, 128);;
    const buf_22 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv1.bn.running_mean']));
    const buf_23 = createEmptyBuf(device, 128);;
    const buf_24 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv1.bn.weight']));
    const buf_25 = createEmptyBuf(device, 128);;
    const buf_26 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv1.bn.bias']));
    const buf_27 = createEmptyBuf(device, 9216);;
    const buf_28 = createWeightBuf(device, 4608, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv1.conv.weight']));
    const buf_29 = createEmptyBuf(device, 64);;
    const buf_30 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv1.bn.running_mean']));
    const buf_31 = createEmptyBuf(device, 64);;
    const buf_32 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv1.bn.weight']));
    const buf_33 = createEmptyBuf(device, 64);;
    const buf_34 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv1.bn.bias']));
    const buf_35 = createEmptyBuf(device, 9216);;
    const buf_36 = createWeightBuf(device, 4608, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv2.conv.weight']));
    const buf_37 = createEmptyBuf(device, 64);;
    const buf_38 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv2.bn.running_mean']));
    const buf_39 = createEmptyBuf(device, 64);;
    const buf_40 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv2.bn.weight']));
    const buf_41 = createEmptyBuf(device, 64);;
    const buf_42 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv2.bn.bias']));
    const buf_43 = createEmptyBuf(device, 6144);;
    const buf_44 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['net.b2.0.cv2.conv.weight']));
    const buf_45 = createEmptyBuf(device, 128);;
    const buf_46 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv2.bn.running_mean']));
    const buf_47 = createEmptyBuf(device, 128);;
    const buf_48 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv2.bn.weight']));
    const buf_49 = createEmptyBuf(device, 128);;
    const buf_50 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv2.bn.bias']));
    const buf_51 = createEmptyBuf(device, 73728);;
    const buf_52 = createWeightBuf(device, 36864, getTensorBuffer(safetensor, metadata['net.b2.1.conv.weight']));
    const buf_53 = createEmptyBuf(device, 256);;
    const buf_54 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.1.bn.running_mean']));
    const buf_55 = createEmptyBuf(device, 256);;
    const buf_56 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.1.bn.weight']));
    const buf_57 = createEmptyBuf(device, 256);;
    const buf_58 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.1.bn.bias']));
    const buf_59 = createEmptyBuf(device, 16384);;
    const buf_60 = createWeightBuf(device, 8192, getTensorBuffer(safetensor, metadata['net.b2.2.cv1.conv.weight']));
    const buf_61 = createEmptyBuf(device, 256);;
    const buf_62 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv1.bn.running_mean']));
    const buf_63 = createEmptyBuf(device, 256);;
    const buf_64 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv1.bn.weight']));
    const buf_65 = createEmptyBuf(device, 256);;
    const buf_66 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv1.bn.bias']));
    const buf_67 = createEmptyBuf(device, 36864);;
    const buf_68 = createWeightBuf(device, 18432, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv1.conv.weight']));
    const buf_69 = createEmptyBuf(device, 128);;
    const buf_70 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv1.bn.running_mean']));
    const buf_71 = createEmptyBuf(device, 128);;
    const buf_72 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv1.bn.weight']));
    const buf_73 = createEmptyBuf(device, 128);;
    const buf_74 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv1.bn.bias']));
    const buf_75 = createEmptyBuf(device, 36864);;
    const buf_76 = createWeightBuf(device, 18432, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv2.conv.weight']));
    const buf_77 = createEmptyBuf(device, 128);;
    const buf_78 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv2.bn.running_mean']));
    const buf_79 = createEmptyBuf(device, 128);;
    const buf_80 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv2.bn.weight']));
    const buf_81 = createEmptyBuf(device, 128);;
    const buf_82 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv2.bn.bias']));
    const buf_83 = createEmptyBuf(device, 36864);;
    const buf_84 = createWeightBuf(device, 18432, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv1.conv.weight']));
    const buf_85 = createEmptyBuf(device, 128);;
    const buf_86 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv1.bn.running_mean']));
    const buf_87 = createEmptyBuf(device, 128);;
    const buf_88 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv1.bn.weight']));
    const buf_89 = createEmptyBuf(device, 128);;
    const buf_90 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv1.bn.bias']));
    const buf_91 = createEmptyBuf(device, 36864);;
    const buf_92 = createWeightBuf(device, 18432, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv2.conv.weight']));
    const buf_93 = createEmptyBuf(device, 128);;
    const buf_94 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv2.bn.running_mean']));
    const buf_95 = createEmptyBuf(device, 128);;
    const buf_96 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv2.bn.weight']));
    const buf_97 = createEmptyBuf(device, 128);;
    const buf_98 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv2.bn.bias']));
    const buf_99 = createEmptyBuf(device, 32768);;
    const buf_100 = createWeightBuf(device, 16384, getTensorBuffer(safetensor, metadata['net.b2.2.cv2.conv.weight']));
    const buf_101 = createEmptyBuf(device, 256);;
    const buf_102 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv2.bn.running_mean']));
    const buf_103 = createEmptyBuf(device, 256);;
    const buf_104 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv2.bn.weight']));
    const buf_105 = createEmptyBuf(device, 256);;
    const buf_106 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv2.bn.bias']));
    const buf_107 = createEmptyBuf(device, 294912);;
    const buf_108 = createWeightBuf(device, 147456, getTensorBuffer(safetensor, metadata['net.b3.0.conv.weight']));
    const buf_109 = createEmptyBuf(device, 512);;
    const buf_110 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.0.bn.running_mean']));
    const buf_111 = createEmptyBuf(device, 512);;
    const buf_112 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.0.bn.weight']));
    const buf_113 = createEmptyBuf(device, 512);;
    const buf_114 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.0.bn.bias']));
    const buf_115 = createEmptyBuf(device, 65536);;
    const buf_116 = createWeightBuf(device, 32768, getTensorBuffer(safetensor, metadata['net.b3.1.cv1.conv.weight']));
    const buf_117 = createEmptyBuf(device, 512);;
    const buf_118 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv1.bn.running_mean']));
    const buf_119 = createEmptyBuf(device, 512);;
    const buf_120 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv1.bn.weight']));
    const buf_121 = createEmptyBuf(device, 512);;
    const buf_122 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv1.bn.bias']));
    const buf_123 = createEmptyBuf(device, 147456);;
    const buf_124 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv1.conv.weight']));
    const buf_125 = createEmptyBuf(device, 256);;
    const buf_126 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv1.bn.running_mean']));
    const buf_127 = createEmptyBuf(device, 256);;
    const buf_128 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv1.bn.weight']));
    const buf_129 = createEmptyBuf(device, 256);;
    const buf_130 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv1.bn.bias']));
    const buf_131 = createEmptyBuf(device, 147456);;
    const buf_132 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv2.conv.weight']));
    const buf_133 = createEmptyBuf(device, 256);;
    const buf_134 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv2.bn.running_mean']));
    const buf_135 = createEmptyBuf(device, 256);;
    const buf_136 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv2.bn.weight']));
    const buf_137 = createEmptyBuf(device, 256);;
    const buf_138 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv2.bn.bias']));
    const buf_139 = createEmptyBuf(device, 147456);;
    const buf_140 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv1.conv.weight']));
    const buf_141 = createEmptyBuf(device, 256);;
    const buf_142 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv1.bn.running_mean']));
    const buf_143 = createEmptyBuf(device, 256);;
    const buf_144 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv1.bn.weight']));
    const buf_145 = createEmptyBuf(device, 256);;
    const buf_146 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv1.bn.bias']));
    const buf_147 = createEmptyBuf(device, 147456);;
    const buf_148 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv2.conv.weight']));
    const buf_149 = createEmptyBuf(device, 256);;
    const buf_150 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv2.bn.running_mean']));
    const buf_151 = createEmptyBuf(device, 256);;
    const buf_152 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv2.bn.weight']));
    const buf_153 = createEmptyBuf(device, 256);;
    const buf_154 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv2.bn.bias']));
    const buf_155 = createEmptyBuf(device, 131072);;
    const buf_156 = createWeightBuf(device, 65536, getTensorBuffer(safetensor, metadata['net.b3.1.cv2.conv.weight']));
    const buf_157 = createEmptyBuf(device, 512);;
    const buf_158 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv2.bn.running_mean']));
    const buf_159 = createEmptyBuf(device, 512);;
    const buf_160 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv2.bn.weight']));
    const buf_161 = createEmptyBuf(device, 512);;
    const buf_162 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv2.bn.bias']));
    const buf_163 = createEmptyBuf(device, 1179648);;
    const buf_164 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['net.b4.0.conv.weight']));
    const buf_165 = createEmptyBuf(device, 1024);;
    const buf_166 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.0.bn.running_mean']));
    const buf_167 = createEmptyBuf(device, 1024);;
    const buf_168 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.0.bn.weight']));
    const buf_169 = createEmptyBuf(device, 1024);;
    const buf_170 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.0.bn.bias']));
    const buf_171 = createEmptyBuf(device, 262144);;
    const buf_172 = createWeightBuf(device, 131072, getTensorBuffer(safetensor, metadata['net.b4.1.cv1.conv.weight']));
    const buf_173 = createEmptyBuf(device, 1024);;
    const buf_174 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv1.bn.running_mean']));
    const buf_175 = createEmptyBuf(device, 1024);;
    const buf_176 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv1.bn.weight']));
    const buf_177 = createEmptyBuf(device, 1024);;
    const buf_178 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv1.bn.bias']));
    const buf_179 = createEmptyBuf(device, 589824);;
    const buf_180 = createWeightBuf(device, 294912, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv1.conv.weight']));
    const buf_181 = createEmptyBuf(device, 512);;
    const buf_182 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv1.bn.running_mean']));
    const buf_183 = createEmptyBuf(device, 512);;
    const buf_184 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv1.bn.weight']));
    const buf_185 = createEmptyBuf(device, 512);;
    const buf_186 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv1.bn.bias']));
    const buf_187 = createEmptyBuf(device, 589824);;
    const buf_188 = createWeightBuf(device, 294912, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv2.conv.weight']));
    const buf_189 = createEmptyBuf(device, 512);;
    const buf_190 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv2.bn.running_mean']));
    const buf_191 = createEmptyBuf(device, 512);;
    const buf_192 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv2.bn.weight']));
    const buf_193 = createEmptyBuf(device, 512);;
    const buf_194 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv2.bn.bias']));
    const buf_195 = createEmptyBuf(device, 393216);;
    const buf_196 = createWeightBuf(device, 196608, getTensorBuffer(safetensor, metadata['net.b4.1.cv2.conv.weight']));
    const buf_197 = createEmptyBuf(device, 1024);;
    const buf_198 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv2.bn.running_mean']));
    const buf_199 = createEmptyBuf(device, 1024);;
    const buf_200 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv2.bn.weight']));
    const buf_201 = createEmptyBuf(device, 1024);;
    const buf_202 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv2.bn.bias']));
    const buf_203 = createEmptyBuf(device, 131072);;
    const buf_204 = createWeightBuf(device, 65536, getTensorBuffer(safetensor, metadata['net.b5.0.cv1.conv.weight']));
    const buf_205 = createEmptyBuf(device, 512);;
    const buf_206 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b5.0.cv1.bn.running_mean']));
    const buf_207 = createEmptyBuf(device, 512);;
    const buf_208 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b5.0.cv1.bn.weight']));
    const buf_209 = createEmptyBuf(device, 512);;
    const buf_210 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b5.0.cv1.bn.bias']));
    const buf_211 = createEmptyBuf(device, 524288);;
    const buf_212 = createWeightBuf(device, 262144, getTensorBuffer(safetensor, metadata['net.b5.0.cv2.conv.weight']));
    const buf_213 = createEmptyBuf(device, 1024);;
    const buf_214 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b5.0.cv2.bn.running_mean']));
    const buf_215 = createEmptyBuf(device, 1024);;
    const buf_216 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b5.0.cv2.bn.weight']));
    const buf_217 = createEmptyBuf(device, 1024);;
    const buf_218 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b5.0.cv2.bn.bias']));
    const buf_219 = createEmptyBuf(device, 196608);;
    const buf_220 = createWeightBuf(device, 98304, getTensorBuffer(safetensor, metadata['fpn.n1.cv1.conv.weight']));
    const buf_221 = createEmptyBuf(device, 512);;
    const buf_222 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv1.bn.running_mean']));
    const buf_223 = createEmptyBuf(device, 512);;
    const buf_224 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv1.bn.weight']));
    const buf_225 = createEmptyBuf(device, 512);;
    const buf_226 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv1.bn.bias']));
    const buf_227 = createEmptyBuf(device, 147456);;
    const buf_228 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv1.conv.weight']));
    const buf_229 = createEmptyBuf(device, 256);;
    const buf_230 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv1.bn.running_mean']));
    const buf_231 = createEmptyBuf(device, 256);;
    const buf_232 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv1.bn.weight']));
    const buf_233 = createEmptyBuf(device, 256);;
    const buf_234 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv1.bn.bias']));
    const buf_235 = createEmptyBuf(device, 147456);;
    const buf_236 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv2.conv.weight']));
    const buf_237 = createEmptyBuf(device, 256);;
    const buf_238 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv2.bn.running_mean']));
    const buf_239 = createEmptyBuf(device, 256);;
    const buf_240 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv2.bn.weight']));
    const buf_241 = createEmptyBuf(device, 256);;
    const buf_242 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv2.bn.bias']));
    const buf_243 = createEmptyBuf(device, 98304);;
    const buf_244 = createWeightBuf(device, 49152, getTensorBuffer(safetensor, metadata['fpn.n1.cv2.conv.weight']));
    const buf_245 = createEmptyBuf(device, 512);;
    const buf_246 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv2.bn.running_mean']));
    const buf_247 = createEmptyBuf(device, 512);;
    const buf_248 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv2.bn.weight']));
    const buf_249 = createEmptyBuf(device, 512);;
    const buf_250 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv2.bn.bias']));
    const buf_251 = createEmptyBuf(device, 49152);;
    const buf_252 = createWeightBuf(device, 24576, getTensorBuffer(safetensor, metadata['fpn.n2.cv1.conv.weight']));
    const buf_253 = createEmptyBuf(device, 256);;
    const buf_254 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv1.bn.running_mean']));
    const buf_255 = createEmptyBuf(device, 256);;
    const buf_256 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv1.bn.weight']));
    const buf_257 = createEmptyBuf(device, 256);;
    const buf_258 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv1.bn.bias']));
    const buf_259 = createEmptyBuf(device, 36864);;
    const buf_260 = createWeightBuf(device, 18432, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv1.conv.weight']));
    const buf_261 = createEmptyBuf(device, 128);;
    const buf_262 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv1.bn.running_mean']));
    const buf_263 = createEmptyBuf(device, 128);;
    const buf_264 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv1.bn.weight']));
    const buf_265 = createEmptyBuf(device, 128);;
    const buf_266 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv1.bn.bias']));
    const buf_267 = createEmptyBuf(device, 36864);;
    const buf_268 = createWeightBuf(device, 18432, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv2.conv.weight']));
    const buf_269 = createEmptyBuf(device, 128);;
    const buf_270 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv2.bn.running_mean']));
    const buf_271 = createEmptyBuf(device, 128);;
    const buf_272 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv2.bn.weight']));
    const buf_273 = createEmptyBuf(device, 128);;
    const buf_274 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv2.bn.bias']));
    const buf_275 = createEmptyBuf(device, 24576);;
    const buf_276 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['fpn.n2.cv2.conv.weight']));
    const buf_277 = createEmptyBuf(device, 256);;
    const buf_278 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv2.bn.running_mean']));
    const buf_279 = createEmptyBuf(device, 256);;
    const buf_280 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv2.bn.weight']));
    const buf_281 = createEmptyBuf(device, 256);;
    const buf_282 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv2.bn.bias']));
    const buf_283 = createEmptyBuf(device, 147456);;
    const buf_284 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['head.cv2.0.0.conv.weight']));
    const buf_285 = createEmptyBuf(device, 256);;
    const buf_286 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.0.bn.running_mean']));
    const buf_287 = createEmptyBuf(device, 256);;
    const buf_288 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.0.bn.weight']));
    const buf_289 = createEmptyBuf(device, 256);;
    const buf_290 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.0.bn.bias']));
    const buf_291 = createEmptyBuf(device, 147456);;
    const buf_292 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['head.cv2.0.1.conv.weight']));
    const buf_293 = createEmptyBuf(device, 256);;
    const buf_294 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.1.bn.running_mean']));
    const buf_295 = createEmptyBuf(device, 256);;
    const buf_296 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.1.bn.weight']));
    const buf_297 = createEmptyBuf(device, 256);;
    const buf_298 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.1.bn.bias']));
    const buf_299 = createEmptyBuf(device, 16384);;
    const buf_300 = createWeightBuf(device, 8192, getTensorBuffer(safetensor, metadata['head.cv2.0.2.weight']));
    const buf_301 = createEmptyBuf(device, 256);;
    const buf_302 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.2.bias']));
    const buf_303 = createEmptyBuf(device, 184320);;
    const buf_304 = createWeightBuf(device, 92160, getTensorBuffer(safetensor, metadata['head.cv3.0.0.conv.weight']));
    const buf_305 = createEmptyBuf(device, 320);;
    const buf_306 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.0.bn.running_mean']));
    const buf_307 = createEmptyBuf(device, 320);;
    const buf_308 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.0.bn.weight']));
    const buf_309 = createEmptyBuf(device, 320);;
    const buf_310 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.0.bn.bias']));
    const buf_311 = createEmptyBuf(device, 230400);;
    const buf_312 = createWeightBuf(device, 115200, getTensorBuffer(safetensor, metadata['head.cv3.0.1.conv.weight']));
    const buf_313 = createEmptyBuf(device, 320);;
    const buf_314 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.1.bn.running_mean']));
    const buf_315 = createEmptyBuf(device, 320);;
    const buf_316 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.1.bn.weight']));
    const buf_317 = createEmptyBuf(device, 320);;
    const buf_318 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.1.bn.bias']));
    const buf_319 = createEmptyBuf(device, 25600);;
    const buf_320 = createWeightBuf(device, 12800, getTensorBuffer(safetensor, metadata['head.cv3.0.2.weight']));
    const buf_321 = createEmptyBuf(device, 320);;
    const buf_322 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.2.bias']));
    const buf_323 = createEmptyBuf(device, 147456);;
    const buf_324 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['fpn.n3.conv.weight']));
    const buf_325 = createEmptyBuf(device, 256);;
    const buf_326 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n3.bn.running_mean']));
    const buf_327 = createEmptyBuf(device, 256);;
    const buf_328 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n3.bn.weight']));
    const buf_329 = createEmptyBuf(device, 256);;
    const buf_330 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n3.bn.bias']));
    const buf_331 = createEmptyBuf(device, 98304);;
    const buf_332 = createWeightBuf(device, 49152, getTensorBuffer(safetensor, metadata['fpn.n4.cv1.conv.weight']));
    const buf_333 = createEmptyBuf(device, 512);;
    const buf_334 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv1.bn.running_mean']));
    const buf_335 = createEmptyBuf(device, 512);;
    const buf_336 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv1.bn.weight']));
    const buf_337 = createEmptyBuf(device, 512);;
    const buf_338 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv1.bn.bias']));
    const buf_339 = createEmptyBuf(device, 147456);;
    const buf_340 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv1.conv.weight']));
    const buf_341 = createEmptyBuf(device, 256);;
    const buf_342 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv1.bn.running_mean']));
    const buf_343 = createEmptyBuf(device, 256);;
    const buf_344 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv1.bn.weight']));
    const buf_345 = createEmptyBuf(device, 256);;
    const buf_346 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv1.bn.bias']));
    const buf_347 = createEmptyBuf(device, 147456);;
    const buf_348 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv2.conv.weight']));
    const buf_349 = createEmptyBuf(device, 256);;
    const buf_350 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv2.bn.running_mean']));
    const buf_351 = createEmptyBuf(device, 256);;
    const buf_352 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv2.bn.weight']));
    const buf_353 = createEmptyBuf(device, 256);;
    const buf_354 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv2.bn.bias']));
    const buf_355 = createEmptyBuf(device, 98304);;
    const buf_356 = createWeightBuf(device, 49152, getTensorBuffer(safetensor, metadata['fpn.n4.cv2.conv.weight']));
    const buf_357 = createEmptyBuf(device, 512);;
    const buf_358 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv2.bn.running_mean']));
    const buf_359 = createEmptyBuf(device, 512);;
    const buf_360 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv2.bn.weight']));
    const buf_361 = createEmptyBuf(device, 512);;
    const buf_362 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv2.bn.bias']));
    const buf_363 = createEmptyBuf(device, 294912);;
    const buf_364 = createWeightBuf(device, 147456, getTensorBuffer(safetensor, metadata['head.cv2.1.0.conv.weight']));
    const buf_365 = createEmptyBuf(device, 256);;
    const buf_366 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.0.bn.running_mean']));
    const buf_367 = createEmptyBuf(device, 256);;
    const buf_368 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.0.bn.weight']));
    const buf_369 = createEmptyBuf(device, 256);;
    const buf_370 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.0.bn.bias']));
    const buf_371 = createEmptyBuf(device, 147456);;
    const buf_372 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['head.cv2.1.1.conv.weight']));
    const buf_373 = createEmptyBuf(device, 256);;
    const buf_374 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.1.bn.running_mean']));
    const buf_375 = createEmptyBuf(device, 256);;
    const buf_376 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.1.bn.weight']));
    const buf_377 = createEmptyBuf(device, 256);;
    const buf_378 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.1.bn.bias']));
    const buf_379 = createEmptyBuf(device, 16384);;
    const buf_380 = createWeightBuf(device, 8192, getTensorBuffer(safetensor, metadata['head.cv2.1.2.weight']));
    const buf_381 = createEmptyBuf(device, 256);;
    const buf_382 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.2.bias']));
    const buf_383 = createEmptyBuf(device, 368640);;
    const buf_384 = createWeightBuf(device, 184320, getTensorBuffer(safetensor, metadata['head.cv3.1.0.conv.weight']));
    const buf_385 = createEmptyBuf(device, 320);;
    const buf_386 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.0.bn.running_mean']));
    const buf_387 = createEmptyBuf(device, 320);;
    const buf_388 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.0.bn.weight']));
    const buf_389 = createEmptyBuf(device, 320);;
    const buf_390 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.0.bn.bias']));
    const buf_391 = createEmptyBuf(device, 230400);;
    const buf_392 = createWeightBuf(device, 115200, getTensorBuffer(safetensor, metadata['head.cv3.1.1.conv.weight']));
    const buf_393 = createEmptyBuf(device, 320);;
    const buf_394 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.1.bn.running_mean']));
    const buf_395 = createEmptyBuf(device, 320);;
    const buf_396 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.1.bn.weight']));
    const buf_397 = createEmptyBuf(device, 320);;
    const buf_398 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.1.bn.bias']));
    const buf_399 = createEmptyBuf(device, 25600);;
    const buf_400 = createWeightBuf(device, 12800, getTensorBuffer(safetensor, metadata['head.cv3.1.2.weight']));
    const buf_401 = createEmptyBuf(device, 320);;
    const buf_402 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.2.bias']));
    const buf_403 = createEmptyBuf(device, 589824);;
    const buf_404 = createWeightBuf(device, 294912, getTensorBuffer(safetensor, metadata['fpn.n5.conv.weight']));
    const buf_405 = createEmptyBuf(device, 512);;
    const buf_406 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n5.bn.running_mean']));
    const buf_407 = createEmptyBuf(device, 512);;
    const buf_408 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n5.bn.weight']));
    const buf_409 = createEmptyBuf(device, 512);;
    const buf_410 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n5.bn.bias']));
    const buf_411 = createEmptyBuf(device, 393216);;
    const buf_412 = createWeightBuf(device, 196608, getTensorBuffer(safetensor, metadata['fpn.n6.cv1.conv.weight']));
    const buf_413 = createEmptyBuf(device, 1024);;
    const buf_414 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv1.bn.running_mean']));
    const buf_415 = createEmptyBuf(device, 1024);;
    const buf_416 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv1.bn.weight']));
    const buf_417 = createEmptyBuf(device, 1024);;
    const buf_418 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv1.bn.bias']));
    const buf_419 = createEmptyBuf(device, 589824);;
    const buf_420 = createWeightBuf(device, 294912, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv1.conv.weight']));
    const buf_421 = createEmptyBuf(device, 512);;
    const buf_422 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv1.bn.running_mean']));
    const buf_423 = createEmptyBuf(device, 512);;
    const buf_424 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv1.bn.weight']));
    const buf_425 = createEmptyBuf(device, 512);;
    const buf_426 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv1.bn.bias']));
    const buf_427 = createEmptyBuf(device, 589824);;
    const buf_428 = createWeightBuf(device, 294912, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv2.conv.weight']));
    const buf_429 = createEmptyBuf(device, 512);;
    const buf_430 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv2.bn.running_mean']));
    const buf_431 = createEmptyBuf(device, 512);;
    const buf_432 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv2.bn.weight']));
    const buf_433 = createEmptyBuf(device, 512);;
    const buf_434 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv2.bn.bias']));
    const buf_435 = createEmptyBuf(device, 393216);;
    const buf_436 = createWeightBuf(device, 196608, getTensorBuffer(safetensor, metadata['fpn.n6.cv2.conv.weight']));
    const buf_437 = createEmptyBuf(device, 1024);;
    const buf_438 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv2.bn.running_mean']));
    const buf_439 = createEmptyBuf(device, 1024);;
    const buf_440 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv2.bn.weight']));
    const buf_441 = createEmptyBuf(device, 1024);;
    const buf_442 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv2.bn.bias']));
    const buf_443 = createEmptyBuf(device, 589824);;
    const buf_444 = createWeightBuf(device, 294912, getTensorBuffer(safetensor, metadata['head.cv2.2.0.conv.weight']));
    const buf_445 = createEmptyBuf(device, 256);;
    const buf_446 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.0.bn.running_mean']));
    const buf_447 = createEmptyBuf(device, 256);;
    const buf_448 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.0.bn.weight']));
    const buf_449 = createEmptyBuf(device, 256);;
    const buf_450 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.0.bn.bias']));
    const buf_451 = createEmptyBuf(device, 147456);;
    const buf_452 = createWeightBuf(device, 73728, getTensorBuffer(safetensor, metadata['head.cv2.2.1.conv.weight']));
    const buf_453 = createEmptyBuf(device, 256);;
    const buf_454 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.1.bn.running_mean']));
    const buf_455 = createEmptyBuf(device, 256);;
    const buf_456 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.1.bn.weight']));
    const buf_457 = createEmptyBuf(device, 256);;
    const buf_458 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.1.bn.bias']));
    const buf_459 = createEmptyBuf(device, 16384);;
    const buf_460 = createWeightBuf(device, 8192, getTensorBuffer(safetensor, metadata['head.cv2.2.2.weight']));
    const buf_461 = createEmptyBuf(device, 256);;
    const buf_462 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.2.bias']));
    const buf_463 = createEmptyBuf(device, 737280);;
    const buf_464 = createWeightBuf(device, 368640, getTensorBuffer(safetensor, metadata['head.cv3.2.0.conv.weight']));
    const buf_465 = createEmptyBuf(device, 320);;
    const buf_466 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.0.bn.running_mean']));
    const buf_467 = createEmptyBuf(device, 320);;
    const buf_468 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.0.bn.weight']));
    const buf_469 = createEmptyBuf(device, 320);;
    const buf_470 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.0.bn.bias']));
    const buf_471 = createEmptyBuf(device, 230400);;
    const buf_472 = createWeightBuf(device, 115200, getTensorBuffer(safetensor, metadata['head.cv3.2.1.conv.weight']));
    const buf_473 = createEmptyBuf(device, 320);;
    const buf_474 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.1.bn.running_mean']));
    const buf_475 = createEmptyBuf(device, 320);;
    const buf_476 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.1.bn.weight']));
    const buf_477 = createEmptyBuf(device, 320);;
    const buf_478 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.1.bn.bias']));
    const buf_479 = createEmptyBuf(device, 25600);;
    const buf_480 = createWeightBuf(device, 12800, getTensorBuffer(safetensor, metadata['head.cv3.2.2.weight']));
    const buf_481 = createEmptyBuf(device, 320);;
    const buf_482 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.2.bias']));
    const buf_483 = createEmptyBuf(device, 64);;
    const buf_484 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['head.dfl.conv.weight']));
    const buf_485 = createEmptyBuf(device, 14196);;
    const buf_486 = createEmptyBuf(device, 320);;
    const buf_487 = createEmptyBuf(device, 14196);;
    const buf_488 = createEmptyBuf(device, 2768896);;
    const input0 = createEmptyBuf(device, 2076672);;
    const buf_489 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b1.0.bn.running_var']));
    const buf_490 = createEmptyBuf(device, 1384448);;
    const buf_491 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b1.1.bn.running_var']));
    const buf_492 = createEmptyBuf(device, 1384448);;
    const buf_493 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv1.bn.running_var']));
    const buf_494 = createEmptyBuf(device, 692224);;
    const buf_495 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv1.bn.running_var']));
    const buf_496 = createEmptyBuf(device, 692224);;
    const buf_497 = createWeightBuf(device, 32, getTensorBuffer(safetensor, metadata['net.b2.0.bottleneck.0.cv2.bn.running_var']));
    const buf_498 = createEmptyBuf(device, 2076672);;
    const buf_499 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.0.cv2.bn.running_var']));
    const buf_500 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.1.bn.running_var']));
    const buf_501 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv1.bn.running_var']));
    const buf_502 = createEmptyBuf(device, 346112);;
    const buf_503 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv1.bn.running_var']));
    const buf_504 = createEmptyBuf(device, 346112);;
    const buf_505 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.0.cv2.bn.running_var']));
    const buf_506 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv1.bn.running_var']));
    const buf_507 = createEmptyBuf(device, 346112);;
    const buf_508 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['net.b2.2.bottleneck.1.cv2.bn.running_var']));
    const buf_509 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b2.2.cv2.bn.running_var']));
    const buf_510 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.0.bn.running_var']));
    const buf_511 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv1.bn.running_var']));
    const buf_512 = createEmptyBuf(device, 173056);;
    const buf_513 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv1.bn.running_var']));
    const buf_514 = createEmptyBuf(device, 173056);;
    const buf_515 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.0.cv2.bn.running_var']));
    const buf_516 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv1.bn.running_var']));
    const buf_517 = createEmptyBuf(device, 173056);;
    const buf_518 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['net.b3.1.bottleneck.1.cv2.bn.running_var']));
    const buf_519 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b3.1.cv2.bn.running_var']));
    const buf_520 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.0.bn.running_var']));
    const buf_521 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv1.bn.running_var']));
    const buf_522 = createEmptyBuf(device, 86528);;
    const buf_523 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv1.bn.running_var']));
    const buf_524 = createEmptyBuf(device, 86528);;
    const buf_525 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b4.1.bottleneck.0.cv2.bn.running_var']));
    const buf_526 = createEmptyBuf(device, 259584);;
    const buf_527 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b4.1.cv2.bn.running_var']));
    const buf_528 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['net.b5.0.cv1.bn.running_var']));
    const buf_529 = createEmptyBuf(device, 86528);;
    const buf_530 = createEmptyBuf(device, 86528);;
    const buf_531 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['net.b5.0.cv2.bn.running_var']));
    const buf_532 = createEmptyBuf(device, 1038336);;
    const buf_533 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv1.bn.running_var']));
    const buf_534 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv1.bn.running_var']));
    const buf_535 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n1.bottleneck.0.cv2.bn.running_var']));
    const buf_536 = createEmptyBuf(device, 519168);;
    const buf_537 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n1.cv2.bn.running_var']));
    const buf_538 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv1.bn.running_var']));
    const buf_539 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv1.bn.running_var']));
    const buf_540 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['fpn.n2.bottleneck.0.cv2.bn.running_var']));
    const buf_541 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n2.cv2.bn.running_var']));
    const buf_542 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.0.bn.running_var']));
    const buf_543 = createEmptyBuf(device, 865280);;
    const buf_544 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.0.bn.running_var']));
    const buf_545 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n3.bn.running_var']));
    const buf_546 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.0.1.bn.running_var']));
    const buf_547 = createEmptyBuf(device, 865280);;
    const buf_548 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.0.1.bn.running_var']));
    const buf_549 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv1.bn.running_var']));
    const buf_550 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv1.bn.running_var']));
    const buf_551 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['fpn.n4.bottleneck.0.cv2.bn.running_var']));
    const buf_552 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n4.cv2.bn.running_var']));
    const buf_553 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.0.bn.running_var']));
    const buf_554 = createEmptyBuf(device, 216320);;
    const buf_555 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.0.bn.running_var']));
    const buf_556 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n5.bn.running_var']));
    const buf_557 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.1.1.bn.running_var']));
    const buf_558 = createEmptyBuf(device, 216320);;
    const buf_559 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.1.1.bn.running_var']));
    const buf_560 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv1.bn.running_var']));
    const buf_561 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv1.bn.running_var']));
    const buf_562 = createWeightBuf(device, 256, getTensorBuffer(safetensor, metadata['fpn.n6.bottleneck.0.cv2.bn.running_var']));
    const buf_563 = createWeightBuf(device, 512, getTensorBuffer(safetensor, metadata['fpn.n6.cv2.bn.running_var']));
    const buf_564 = createEmptyBuf(device, 43264);;
    const buf_565 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.0.bn.running_var']));
    const buf_566 = createEmptyBuf(device, 54080);;
    const buf_567 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.0.bn.running_var']));
    const buf_568 = createEmptyBuf(device, 43264);;
    const buf_569 = createWeightBuf(device, 128, getTensorBuffer(safetensor, metadata['head.cv2.2.1.bn.running_var']));
    const buf_570 = createEmptyBuf(device, 54080);;
    const buf_571 = createWeightBuf(device, 160, getTensorBuffer(safetensor, metadata['head.cv3.2.1.bn.running_var']));
    const buf_572 = createEmptyBuf(device, 56784);;
    const buf_573 = createEmptyBuf(device, 1135680);;
    const buf_574 = createEmptyBuf(device, 56784);;
    const buf_575 = createEmptyBuf(device, 56784);;
    const buf_576 = createEmptyBuf(device, 28392);;
    const buf_577 = createEmptyBuf(device, 28392);;
    const buf_578 = createEmptyBuf(device, 14196);;
    const buf_579 = createEmptyBuf(device, 14196);;
    const buf_580 = createEmptyBuf(device, 14196);;
    const buf_581 = createEmptyBuf(device, 14196);;
    const buf_582 = createEmptyBuf(device, 14196);;
    const buf_583 = createEmptyBuf(device, 14196);;
    const buf_584 = createEmptyBuf(device, 14196);;
    const buf_585 = createEmptyBuf(device, 85176);;
    const buf_586 = createEmptyBuf(device, 14196);;
    const buf_587 = createEmptyBuf(device, 14196);;
    const buf_588 = createEmptyBuf(device, 1200);;
    const buf_589 = createEmptyBuf(device, 7200);;
    const buf_590 = createEmptyBuf(device, 1200);;
    const buf_591 = createEmptyBuf(device, 1200);;
    const output0 = createEmptyBuf(device, 7200);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_13_4_13_4, r_13_2_26, r_13_13, E_27_4_4, E_4_4, E_4_4, E_4_4, E_36_32_4, E_8_4, E_8_4, E_8_4, E_8_32_4, E_8_4, E_8_4, E_8_4, E_18_32_4, E_4_4, E_4_4, E_4_4, E_18_32_4, E_4_4, E_4_4, E_4_4, E_12_32_4, E_8_4, E_8_4, E_8_4, E_144_32_4, E_16_4, E_16_4, E_16_4, E_32_32_4, E_16_4, E_16_4, E_16_4, E_72_32_4, E_8_4, E_8_4, E_8_4, E_72_32_4, E_8_4, E_8_4, E_8_4, E_72_32_4, E_8_4, E_8_4, E_8_4, E_72_32_4, E_8_4, E_8_4, E_8_4, E_64_32_4, E_16_4, E_16_4, E_16_4, E_576_32_4, E_32_4, E_32_4, E_32_4, E_128_32_4, E_32_4, E_32_4, E_32_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_256_32_4, E_32_4, E_32_4, E_32_4, E_2304_32_4, E_2_32_4, E_2_32_4, E_2_32_4, E_512_32_4, E_2_32_4, E_2_32_4, E_2_32_4, E_1152_32_4, E_32_4, E_32_4, E_32_4, E_1152_32_4, E_32_4, E_32_4, E_32_4, E_768_32_4, E_2_32_4, E_2_32_4, E_2_32_4, E_256_32_4, E_32_4, E_32_4, E_32_4, E_1024_32_4, E_2_32_4, E_2_32_4, E_2_32_4, E_384_32_4, E_32_4, E_32_4, E_32_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_192_32_4, E_32_4, E_32_4, E_32_4, E_96_32_4, E_16_4, E_16_4, E_16_4, E_72_32_4, E_8_4, E_8_4, E_8_4, E_72_32_4, E_8_4, E_8_4, E_8_4, E_48_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_32_32_4, E_16_4, E_360_32_4, E_5_4_4, E_5_4_4, E_5_4_4, E_450_32_4, E_5_4_4, E_5_4_4, E_5_4_4, E_50_32_4, E_5_4_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_192_32_4, E_32_4, E_32_4, E_32_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_192_32_4, E_32_4, E_32_4, E_32_4, E_576_32_4n1, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_32_32_4, E_16_4, E_720_32_4, E_5_4_4, E_5_4_4, E_5_4_4, E_450_32_4, E_5_4_4, E_5_4_4, E_5_4_4, E_50_32_4, E_5_4_4, E_1152_32_4, E_32_4, E_32_4, E_32_4, E_768_32_4, E_2_32_4, E_2_32_4, E_2_32_4, E_1152_32_4, E_32_4, E_32_4, E_32_4, E_1152_32_4, E_32_4, E_32_4, E_32_4, E_768_32_4, E_2_32_4, E_2_32_4, E_2_32_4, E_1152_32_4n1, E_16_4, E_16_4, E_16_4, E_288_32_4, E_16_4, E_16_4, E_16_4, E_32_32_4, E_16_4, E_1440_32_4, E_5_4_4, E_5_4_4, E_5_4_4, E_450_32_4, E_5_4_4, E_5_4_4, E_5_4_4, E_50_32_4, E_5_4_4, E_4_4n1, E_1183_3, r_80_16_5, r_1183_3549_3, r_2_13_13_2_16_4_3_4_4_3_3, r_13_13_8_8_2_16_4_4_3_3, r_169_8_16_4_4_32, r_13_13_4_8_2_16_4_4_3_3, r_13_13_4_8_2_16_4_4_3_3n1, E_6_169_8_16_4, r_169_8_16_12_4_4_4, r_13_13_16_4_32_4_4_3_3, r_169_16_4_16_4_4_4, r_13_13_8_4_32_4_4_3_3, r_13_13_8_4_32_4_4_3_3n1, r_13_13_8_4_32_4_4_3_3n2, r_13_13_8_4_32_4_4_3_3n3, E_4_169_32_4_4, r_169_16_4_32_4_4_4, r_13_13_32_2_2_64_4_3_3, r_169_32_32_4_4_4, r_13_13_16_2_2_64_4_3_3, r_13_13_16_2_2_64_4_3_3n1, r_13_13_16_2_2_64_4_3_3n2, r_13_13_16_2_2_64_4_3_3n3, E_8_169_32_4, r_169_32_64_4_4_4, r_2_13_13_32_128_4_3_3, r_2_169_32_64_4_4, r_13_13_32_128_4_3_3, r_13_13_32_128_4_3_3n1, E_12_169_32, r_2_169_32_96_4_4, r_169_32_64_4_4, r_4_13_13_32_5_5, r_4_13_13_32_5_5, r_4_13_13_32_5_5, E_16_169_32, r_2_169_32_128_4_4, E_12_13_13_32_2_2, r_169_32_96_4_4_4, r_13_13_16_2_2_64_4_3_3, r_13_13_16_2_2_64_4_3_3n2, E_6_169_32_4, r_169_32_48_4_4_4, E_6_13_13_32_4_4, r_169_16_4_48_4_4_4, r_13_13_8_4_32_4_4_3_3, r_13_13_8_4_32_4_4_3_3n2, E_3_169_32_4_4, r_169_16_4_24_4_4_4, r_13_13_16_4_64_4_4_3_3, r_5_13_13_4_4_64_4_4_3_3, r_13_13_16_2_2_64_4_3_3n4, r_13_13_16_4_64_4_4_3_3, r_5_13_13_4_4_80_4_4_3_3, E_6_169_32_4n1, r_169_16_4_16_4_4_4n1, r_5_169_4_4_20_4_4_4, r_169_32_48_4_4_4, r_13_13_16_2_2_64_4_3_3, r_13_13_16_2_2_64_4_3_3n2, E_6_169_32_4, r_169_32_48_4_4_4, r_13_13_16_2_2_128_4_3_3, r_5_13_13_4_2_2_128_4_3_3, r_13_13_32_128_4_3_3n2, r_13_13_16_2_2_64_4_3_3n2, r_5_13_13_4_2_2_80_4_3_3, E_12_169_32n1, r_169_16_16_4_4_4, r_5_169_4_20_4_4_4, r_2_169_32_96_4_4, r_13_13_32_128_4_3_3, r_13_13_32_128_4_3_3n3, E_12_169_32, r_2_169_32_96_4_4, r_13_13_16_256_4_3_3, r_5_13_13_4_256_4_3_3, r_13_13_16_64_4_3_3, r_5_13_13_4_80_4_3_3, r_169_16_16_4_4, r_5_169_4_20_4_4, r_1183_4_3_16, E_5_1183_16_3, r_1183_4_3_16n1, r_1183_4_3_16n2, E_1183_3_2, E_1183_3_2n1, E_1183_3n1, E_1183_3n2, E_1183_3n3, E_1183_3n4, r_1183_20_3_4, E_1183_3n5, r_1183_20_3_4n1, E_2_2_2_2_2_2_2_2_2_2_2_2, r_1183_3549_3n1, E_1183_3_6, E_64_32_2, E_16_32_2_2_2, E_32_32_2_2, E_64_32_2, E_8_32_4_2_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_8_16_8_2_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_8_8_16_2_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_4_2_8_16_2_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_2_4_8_16_2_2, E_4_4_8_16_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_8_8_16_2_2n1, E_2_8_8_16_2, E_4_4_8_16_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_16_4_16_2_2, E_16_8_16_2n1, E_2_8_8_16_2, E_4_4_8_16_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_32_2_16_2_2, E_32_4_16_2, E_16_8_16_2n1, E_2_8_8_16_2, E_4_4_8_16_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_32_32_2_2n1, E_64_2_16_2, E_32_4_16_2, E_16_8_16_2n1, E_2_8_8_16_2, E_4_4_8_16_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, E_64_32_2n1, E_64_2_16_2, E_32_4_16_2, E_16_8_16_2n1, E_2_8_8_16_2, E_4_4_8_16_2, E_8_2_8_16_2, E_16_8_16_2, E_16_16_8_2, E_16_32_4_2, E_32_32_2_2, E_64_32_2, r_1183_3549_3n2, r_1183_3549_3n3, E_25_3_4, r_75_4_2_3549_3, E_25_3_4n1, r_75_4_75_4, E_75_4_2_3];
    const pipelines = await Promise.all(kernels.map(async (name, i) => {
      return await device.createComputePipelineAsync({
          layout: device.createPipelineLayout({
              bindGroupLayouts: [layouts[i]],
          }),
          compute: {
              module: device.createShaderModule({
                  code: name,
              }),
              entryPoint: "main",
          },
      });
  }))

    return async (_input0) => {
        const commandEncoder = device.createCommandEncoder();
        await gpuWriteBuffer0.mapAsync(GPUMapMode.WRITE);
        new Float32Array(gpuWriteBuffer0.getMappedRange()).set(_input0);
        gpuWriteBuffer0.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer0, 0, input0, 0, gpuWriteBuffer0.size);
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0], [13, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_1], [13, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_2], [13, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_3, buf_4], [27, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_5, buf_6], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_7, buf_8], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_9, buf_10], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_11, buf_12], [36, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_13, buf_14], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_15, buf_16], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_17, buf_18], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_19, buf_20], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_21, buf_22], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_23, buf_24], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_25, buf_26], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_27, buf_28], [18, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_29, buf_30], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_31, buf_32], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_33, buf_34], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_35, buf_36], [18, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_37, buf_38], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_39, buf_40], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_41, buf_42], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_43, buf_44], [12, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_45, buf_46], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_47, buf_48], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_49, buf_50], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_51, buf_52], [144, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_53, buf_54], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_55, buf_56], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_57, buf_58], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_59, buf_60], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_61, buf_62], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_63, buf_64], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_65, buf_66], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_67, buf_68], [72, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_69, buf_70], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_71, buf_72], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_73, buf_74], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_75, buf_76], [72, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_77, buf_78], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_79, buf_80], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_81, buf_82], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_83, buf_84], [72, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_85, buf_86], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_87, buf_88], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_89, buf_90], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_91, buf_92], [72, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_93, buf_94], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_95, buf_96], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_97, buf_98], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_99, buf_100], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_101, buf_102], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_103, buf_104], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_105, buf_106], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_107, buf_108], [576, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_109, buf_110], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_111, buf_112], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_113, buf_114], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_115, buf_116], [128, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_117, buf_118], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_119, buf_120], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_121, buf_122], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_123, buf_124], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_125, buf_126], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_127, buf_128], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_129, buf_130], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_131, buf_132], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_133, buf_134], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_135, buf_136], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_137, buf_138], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_139, buf_140], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [buf_141, buf_142], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[73], layouts[73], infinityBuf, [buf_143, buf_144], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[74], layouts[74], infinityBuf, [buf_145, buf_146], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[75], layouts[75], infinityBuf, [buf_147, buf_148], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[76], layouts[76], infinityBuf, [buf_149, buf_150], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[77], layouts[77], infinityBuf, [buf_151, buf_152], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[78], layouts[78], infinityBuf, [buf_153, buf_154], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[79], layouts[79], infinityBuf, [buf_155, buf_156], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[80], layouts[80], infinityBuf, [buf_157, buf_158], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[81], layouts[81], infinityBuf, [buf_159, buf_160], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[82], layouts[82], infinityBuf, [buf_161, buf_162], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[83], layouts[83], infinityBuf, [buf_163, buf_164], [2304, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[84], layouts[84], infinityBuf, [buf_165, buf_166], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[85], layouts[85], infinityBuf, [buf_167, buf_168], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[86], layouts[86], infinityBuf, [buf_169, buf_170], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[87], layouts[87], infinityBuf, [buf_171, buf_172], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[88], layouts[88], infinityBuf, [buf_173, buf_174], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[89], layouts[89], infinityBuf, [buf_175, buf_176], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[90], layouts[90], infinityBuf, [buf_177, buf_178], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[91], layouts[91], infinityBuf, [buf_179, buf_180], [1152, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[92], layouts[92], infinityBuf, [buf_181, buf_182], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[93], layouts[93], infinityBuf, [buf_183, buf_184], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[94], layouts[94], infinityBuf, [buf_185, buf_186], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[95], layouts[95], infinityBuf, [buf_187, buf_188], [1152, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[96], layouts[96], infinityBuf, [buf_189, buf_190], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[97], layouts[97], infinityBuf, [buf_191, buf_192], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[98], layouts[98], infinityBuf, [buf_193, buf_194], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[99], layouts[99], infinityBuf, [buf_195, buf_196], [768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[100], layouts[100], infinityBuf, [buf_197, buf_198], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[101], layouts[101], infinityBuf, [buf_199, buf_200], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[102], layouts[102], infinityBuf, [buf_201, buf_202], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[103], layouts[103], infinityBuf, [buf_203, buf_204], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[104], layouts[104], infinityBuf, [buf_205, buf_206], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[105], layouts[105], infinityBuf, [buf_207, buf_208], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[106], layouts[106], infinityBuf, [buf_209, buf_210], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[107], layouts[107], infinityBuf, [buf_211, buf_212], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[108], layouts[108], infinityBuf, [buf_213, buf_214], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[109], layouts[109], infinityBuf, [buf_215, buf_216], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[110], layouts[110], infinityBuf, [buf_217, buf_218], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[111], layouts[111], infinityBuf, [buf_219, buf_220], [384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[112], layouts[112], infinityBuf, [buf_221, buf_222], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[113], layouts[113], infinityBuf, [buf_223, buf_224], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[114], layouts[114], infinityBuf, [buf_225, buf_226], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[115], layouts[115], infinityBuf, [buf_227, buf_228], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[116], layouts[116], infinityBuf, [buf_229, buf_230], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[117], layouts[117], infinityBuf, [buf_231, buf_232], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[118], layouts[118], infinityBuf, [buf_233, buf_234], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[119], layouts[119], infinityBuf, [buf_235, buf_236], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[120], layouts[120], infinityBuf, [buf_237, buf_238], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[121], layouts[121], infinityBuf, [buf_239, buf_240], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[122], layouts[122], infinityBuf, [buf_241, buf_242], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[123], layouts[123], infinityBuf, [buf_243, buf_244], [192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[124], layouts[124], infinityBuf, [buf_245, buf_246], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[125], layouts[125], infinityBuf, [buf_247, buf_248], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[126], layouts[126], infinityBuf, [buf_249, buf_250], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[127], layouts[127], infinityBuf, [buf_251, buf_252], [96, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[128], layouts[128], infinityBuf, [buf_253, buf_254], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[129], layouts[129], infinityBuf, [buf_255, buf_256], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[130], layouts[130], infinityBuf, [buf_257, buf_258], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[131], layouts[131], infinityBuf, [buf_259, buf_260], [72, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[132], layouts[132], infinityBuf, [buf_261, buf_262], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[133], layouts[133], infinityBuf, [buf_263, buf_264], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[134], layouts[134], infinityBuf, [buf_265, buf_266], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[135], layouts[135], infinityBuf, [buf_267, buf_268], [72, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[136], layouts[136], infinityBuf, [buf_269, buf_270], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[137], layouts[137], infinityBuf, [buf_271, buf_272], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[138], layouts[138], infinityBuf, [buf_273, buf_274], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[139], layouts[139], infinityBuf, [buf_275, buf_276], [48, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[140], layouts[140], infinityBuf, [buf_277, buf_278], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[141], layouts[141], infinityBuf, [buf_279, buf_280], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[142], layouts[142], infinityBuf, [buf_281, buf_282], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[143], layouts[143], infinityBuf, [buf_283, buf_284], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[144], layouts[144], infinityBuf, [buf_285, buf_286], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[145], layouts[145], infinityBuf, [buf_287, buf_288], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[146], layouts[146], infinityBuf, [buf_289, buf_290], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[147], layouts[147], infinityBuf, [buf_291, buf_292], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[148], layouts[148], infinityBuf, [buf_293, buf_294], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[149], layouts[149], infinityBuf, [buf_295, buf_296], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[150], layouts[150], infinityBuf, [buf_297, buf_298], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[151], layouts[151], infinityBuf, [buf_299, buf_300], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[152], layouts[152], infinityBuf, [buf_301, buf_302], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[153], layouts[153], infinityBuf, [buf_303, buf_304], [360, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[154], layouts[154], infinityBuf, [buf_305, buf_306], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[155], layouts[155], infinityBuf, [buf_307, buf_308], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[156], layouts[156], infinityBuf, [buf_309, buf_310], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[157], layouts[157], infinityBuf, [buf_311, buf_312], [450, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[158], layouts[158], infinityBuf, [buf_313, buf_314], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[159], layouts[159], infinityBuf, [buf_315, buf_316], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[160], layouts[160], infinityBuf, [buf_317, buf_318], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[161], layouts[161], infinityBuf, [buf_319, buf_320], [50, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[162], layouts[162], infinityBuf, [buf_321, buf_322], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[163], layouts[163], infinityBuf, [buf_323, buf_324], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[164], layouts[164], infinityBuf, [buf_325, buf_326], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[165], layouts[165], infinityBuf, [buf_327, buf_328], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[166], layouts[166], infinityBuf, [buf_329, buf_330], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[167], layouts[167], infinityBuf, [buf_331, buf_332], [192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[168], layouts[168], infinityBuf, [buf_333, buf_334], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[169], layouts[169], infinityBuf, [buf_335, buf_336], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[170], layouts[170], infinityBuf, [buf_337, buf_338], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[171], layouts[171], infinityBuf, [buf_339, buf_340], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[172], layouts[172], infinityBuf, [buf_341, buf_342], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[173], layouts[173], infinityBuf, [buf_343, buf_344], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[174], layouts[174], infinityBuf, [buf_345, buf_346], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[175], layouts[175], infinityBuf, [buf_347, buf_348], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[176], layouts[176], infinityBuf, [buf_349, buf_350], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[177], layouts[177], infinityBuf, [buf_351, buf_352], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[178], layouts[178], infinityBuf, [buf_353, buf_354], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[179], layouts[179], infinityBuf, [buf_355, buf_356], [192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[180], layouts[180], infinityBuf, [buf_357, buf_358], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[181], layouts[181], infinityBuf, [buf_359, buf_360], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[182], layouts[182], infinityBuf, [buf_361, buf_362], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[183], layouts[183], infinityBuf, [buf_363, buf_364], [576, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[184], layouts[184], infinityBuf, [buf_365, buf_366], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[185], layouts[185], infinityBuf, [buf_367, buf_368], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[186], layouts[186], infinityBuf, [buf_369, buf_370], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[187], layouts[187], infinityBuf, [buf_371, buf_372], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[188], layouts[188], infinityBuf, [buf_373, buf_374], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[189], layouts[189], infinityBuf, [buf_375, buf_376], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[190], layouts[190], infinityBuf, [buf_377, buf_378], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[191], layouts[191], infinityBuf, [buf_379, buf_380], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[192], layouts[192], infinityBuf, [buf_381, buf_382], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[193], layouts[193], infinityBuf, [buf_383, buf_384], [720, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[194], layouts[194], infinityBuf, [buf_385, buf_386], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[195], layouts[195], infinityBuf, [buf_387, buf_388], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[196], layouts[196], infinityBuf, [buf_389, buf_390], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[197], layouts[197], infinityBuf, [buf_391, buf_392], [450, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[198], layouts[198], infinityBuf, [buf_393, buf_394], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[199], layouts[199], infinityBuf, [buf_395, buf_396], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[200], layouts[200], infinityBuf, [buf_397, buf_398], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[201], layouts[201], infinityBuf, [buf_399, buf_400], [50, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[202], layouts[202], infinityBuf, [buf_401, buf_402], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[203], layouts[203], infinityBuf, [buf_403, buf_404], [1152, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[204], layouts[204], infinityBuf, [buf_405, buf_406], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[205], layouts[205], infinityBuf, [buf_407, buf_408], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[206], layouts[206], infinityBuf, [buf_409, buf_410], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[207], layouts[207], infinityBuf, [buf_411, buf_412], [768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[208], layouts[208], infinityBuf, [buf_413, buf_414], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[209], layouts[209], infinityBuf, [buf_415, buf_416], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[210], layouts[210], infinityBuf, [buf_417, buf_418], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[211], layouts[211], infinityBuf, [buf_419, buf_420], [1152, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[212], layouts[212], infinityBuf, [buf_421, buf_422], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[213], layouts[213], infinityBuf, [buf_423, buf_424], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[214], layouts[214], infinityBuf, [buf_425, buf_426], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[215], layouts[215], infinityBuf, [buf_427, buf_428], [1152, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[216], layouts[216], infinityBuf, [buf_429, buf_430], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[217], layouts[217], infinityBuf, [buf_431, buf_432], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[218], layouts[218], infinityBuf, [buf_433, buf_434], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[219], layouts[219], infinityBuf, [buf_435, buf_436], [768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[220], layouts[220], infinityBuf, [buf_437, buf_438], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[221], layouts[221], infinityBuf, [buf_439, buf_440], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[222], layouts[222], infinityBuf, [buf_441, buf_442], [2, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[223], layouts[223], infinityBuf, [buf_443, buf_444], [1152, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[224], layouts[224], infinityBuf, [buf_445, buf_446], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[225], layouts[225], infinityBuf, [buf_447, buf_448], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[226], layouts[226], infinityBuf, [buf_449, buf_450], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[227], layouts[227], infinityBuf, [buf_451, buf_452], [288, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[228], layouts[228], infinityBuf, [buf_453, buf_454], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[229], layouts[229], infinityBuf, [buf_455, buf_456], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[230], layouts[230], infinityBuf, [buf_457, buf_458], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[231], layouts[231], infinityBuf, [buf_459, buf_460], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[232], layouts[232], infinityBuf, [buf_461, buf_462], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[233], layouts[233], infinityBuf, [buf_463, buf_464], [1440, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[234], layouts[234], infinityBuf, [buf_465, buf_466], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[235], layouts[235], infinityBuf, [buf_467, buf_468], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[236], layouts[236], infinityBuf, [buf_469, buf_470], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[237], layouts[237], infinityBuf, [buf_471, buf_472], [450, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[238], layouts[238], infinityBuf, [buf_473, buf_474], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[239], layouts[239], infinityBuf, [buf_475, buf_476], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[240], layouts[240], infinityBuf, [buf_477, buf_478], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[241], layouts[241], infinityBuf, [buf_479, buf_480], [50, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[242], layouts[242], infinityBuf, [buf_481, buf_482], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[243], layouts[243], infinityBuf, [buf_483, buf_484], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[244], layouts[244], infinityBuf, [buf_485], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[245], layouts[245], infinityBuf, [buf_486], [80, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[246], layouts[246], infinityBuf, [buf_487], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[247], layouts[247], infinityBuf, [buf_488, input0, buf_3, buf_5, buf_7, buf_489, buf_9], [13, 13, 2]);
        addComputePass(device, commandEncoder, pipelines[248], layouts[248], infinityBuf, [buf_490, buf_488, buf_11, buf_13, buf_15, buf_491, buf_17], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[249], layouts[249], infinityBuf, [buf_492, buf_490, buf_19, buf_21, buf_23, buf_493, buf_25], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[250], layouts[250], infinityBuf, [buf_494, buf_492, buf_27, buf_29, buf_31, buf_495, buf_33], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[251], layouts[251], infinityBuf, [buf_496, buf_492, buf_494, buf_35, buf_37, buf_39, buf_497, buf_41], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[252], layouts[252], infinityBuf, [buf_498, buf_492, buf_496], [169, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[253], layouts[253], infinityBuf, [buf_492, buf_498, buf_43, buf_45, buf_47, buf_499, buf_49], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[254], layouts[254], infinityBuf, [buf_496, buf_492, buf_51, buf_53, buf_55, buf_500, buf_57], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[255], layouts[255], infinityBuf, [buf_494, buf_496, buf_59, buf_61, buf_63, buf_501, buf_65], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[256], layouts[256], infinityBuf, [buf_502, buf_494, buf_67, buf_69, buf_71, buf_503, buf_73], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[257], layouts[257], infinityBuf, [buf_504, buf_494, buf_502, buf_75, buf_77, buf_79, buf_505, buf_81], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[258], layouts[258], infinityBuf, [buf_502, buf_504, buf_83, buf_85, buf_87, buf_506, buf_89], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[259], layouts[259], infinityBuf, [buf_507, buf_504, buf_502, buf_91, buf_93, buf_95, buf_508, buf_97], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[260], layouts[260], infinityBuf, [buf_492, buf_494, buf_504, buf_507], [169, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[261], layouts[261], infinityBuf, [buf_494, buf_492, buf_99, buf_101, buf_103, buf_509, buf_105], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[262], layouts[262], infinityBuf, [buf_507, buf_494, buf_107, buf_109, buf_111, buf_510, buf_113], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[263], layouts[263], infinityBuf, [buf_504, buf_507, buf_115, buf_117, buf_119, buf_511, buf_121], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[264], layouts[264], infinityBuf, [buf_512, buf_504, buf_123, buf_125, buf_127, buf_513, buf_129], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[265], layouts[265], infinityBuf, [buf_514, buf_504, buf_512, buf_131, buf_133, buf_135, buf_515, buf_137], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[266], layouts[266], infinityBuf, [buf_512, buf_514, buf_139, buf_141, buf_143, buf_516, buf_145], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[267], layouts[267], infinityBuf, [buf_517, buf_514, buf_512, buf_147, buf_149, buf_151, buf_518, buf_153], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[268], layouts[268], infinityBuf, [buf_496, buf_504, buf_514, buf_517], [169, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[269], layouts[269], infinityBuf, [buf_504, buf_496, buf_155, buf_157, buf_159, buf_519, buf_161], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[270], layouts[270], infinityBuf, [buf_517, buf_504, buf_163, buf_165, buf_167, buf_520, buf_169], [13, 13, 2]);
        addComputePass(device, commandEncoder, pipelines[271], layouts[271], infinityBuf, [buf_514, buf_517, buf_171, buf_173, buf_175, buf_521, buf_177], [169, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[272], layouts[272], infinityBuf, [buf_522, buf_514, buf_179, buf_181, buf_183, buf_523, buf_185], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[273], layouts[273], infinityBuf, [buf_524, buf_514, buf_522, buf_187, buf_189, buf_191, buf_525, buf_193], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[274], layouts[274], infinityBuf, [buf_526, buf_514, buf_524], [169, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[275], layouts[275], infinityBuf, [buf_514, buf_526, buf_195, buf_197, buf_199, buf_527, buf_201], [169, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[276], layouts[276], infinityBuf, [buf_524, buf_514, buf_203, buf_205, buf_207, buf_528, buf_209], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[277], layouts[277], infinityBuf, [buf_522, buf_524], [13, 13, 4]);
        addComputePass(device, commandEncoder, pipelines[278], layouts[278], infinityBuf, [buf_529, buf_522], [13, 13, 4]);
        addComputePass(device, commandEncoder, pipelines[279], layouts[279], infinityBuf, [buf_530, buf_529], [13, 13, 4]);
        addComputePass(device, commandEncoder, pipelines[280], layouts[280], infinityBuf, [buf_507, buf_524, buf_522, buf_529, buf_530], [169, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[281], layouts[281], infinityBuf, [buf_514, buf_507, buf_211, buf_213, buf_215, buf_531, buf_217], [169, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[282], layouts[282], infinityBuf, [buf_532, buf_514, buf_504], [13, 13, 12]);
        addComputePass(device, commandEncoder, pipelines[283], layouts[283], infinityBuf, [buf_504, buf_532, buf_219, buf_221, buf_223, buf_533, buf_225], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[284], layouts[284], infinityBuf, [buf_517, buf_504, buf_227, buf_229, buf_231, buf_534, buf_233], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[285], layouts[285], infinityBuf, [buf_512, buf_517, buf_235, buf_237, buf_239, buf_535, buf_241], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[286], layouts[286], infinityBuf, [buf_536, buf_504, buf_512], [169, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[287], layouts[287], infinityBuf, [buf_504, buf_536, buf_243, buf_245, buf_247, buf_537, buf_249], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[288], layouts[288], infinityBuf, [buf_498, buf_504, buf_494], [13, 13, 6]);
        addComputePass(device, commandEncoder, pipelines[289], layouts[289], infinityBuf, [buf_494, buf_498, buf_251, buf_253, buf_255, buf_538, buf_257], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[290], layouts[290], infinityBuf, [buf_507, buf_494, buf_259, buf_261, buf_263, buf_539, buf_265], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[291], layouts[291], infinityBuf, [buf_502, buf_507, buf_267, buf_269, buf_271, buf_540, buf_273], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[292], layouts[292], infinityBuf, [buf_532, buf_494, buf_502], [169, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[293], layouts[293], infinityBuf, [buf_494, buf_532, buf_275, buf_277, buf_279, buf_541, buf_281], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[294], layouts[294], infinityBuf, [buf_496, buf_494, buf_283, buf_285, buf_287, buf_542, buf_289], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[295], layouts[295], infinityBuf, [buf_543, buf_494, buf_303, buf_305, buf_307, buf_544, buf_309], [13, 13, 5]);
        addComputePass(device, commandEncoder, pipelines[296], layouts[296], infinityBuf, [buf_512, buf_494, buf_323, buf_325, buf_327, buf_545, buf_329], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[297], layouts[297], infinityBuf, [buf_494, buf_496, buf_291, buf_293, buf_295, buf_546, buf_297], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[298], layouts[298], infinityBuf, [buf_547, buf_543, buf_311, buf_313, buf_315, buf_548, buf_317], [13, 13, 5]);
        addComputePass(device, commandEncoder, pipelines[299], layouts[299], infinityBuf, [buf_536, buf_512, buf_504], [169, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[300], layouts[300], infinityBuf, [buf_496, buf_494, buf_299, buf_301], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[301], layouts[301], infinityBuf, [buf_543, buf_547, buf_319, buf_321], [169, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[302], layouts[302], infinityBuf, [buf_504, buf_536, buf_331, buf_333, buf_335, buf_549, buf_337], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[303], layouts[303], infinityBuf, [buf_512, buf_504, buf_339, buf_341, buf_343, buf_550, buf_345], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[304], layouts[304], infinityBuf, [buf_517, buf_512, buf_347, buf_349, buf_351, buf_551, buf_353], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[305], layouts[305], infinityBuf, [buf_536, buf_504, buf_517], [169, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[306], layouts[306], infinityBuf, [buf_504, buf_536, buf_355, buf_357, buf_359, buf_552, buf_361], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[307], layouts[307], infinityBuf, [buf_517, buf_504, buf_363, buf_365, buf_367, buf_553, buf_369], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[308], layouts[308], infinityBuf, [buf_554, buf_504, buf_383, buf_385, buf_387, buf_555, buf_389], [13, 13, 5]);
        addComputePass(device, commandEncoder, pipelines[309], layouts[309], infinityBuf, [buf_530, buf_504, buf_403, buf_405, buf_407, buf_556, buf_409], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[310], layouts[310], infinityBuf, [buf_512, buf_517, buf_371, buf_373, buf_375, buf_557, buf_377], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[311], layouts[311], infinityBuf, [buf_558, buf_554, buf_391, buf_393, buf_395, buf_559, buf_397], [13, 13, 5]);
        addComputePass(device, commandEncoder, pipelines[312], layouts[312], infinityBuf, [buf_526, buf_530, buf_514], [169, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[313], layouts[313], infinityBuf, [buf_514, buf_512, buf_379, buf_381], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[314], layouts[314], infinityBuf, [buf_554, buf_558, buf_399, buf_401], [169, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[315], layouts[315], infinityBuf, [buf_512, buf_526, buf_411, buf_413, buf_415, buf_560, buf_417], [169, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[316], layouts[316], infinityBuf, [buf_530, buf_512, buf_419, buf_421, buf_423, buf_561, buf_425], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[317], layouts[317], infinityBuf, [buf_529, buf_530, buf_427, buf_429, buf_431, buf_562, buf_433], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[318], layouts[318], infinityBuf, [buf_526, buf_512, buf_529], [169, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[319], layouts[319], infinityBuf, [buf_512, buf_526, buf_435, buf_437, buf_439, buf_563, buf_441], [169, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[320], layouts[320], infinityBuf, [buf_564, buf_512, buf_443, buf_445, buf_447, buf_565, buf_449], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[321], layouts[321], infinityBuf, [buf_566, buf_512, buf_463, buf_465, buf_467, buf_567, buf_469], [13, 13, 5]);
        addComputePass(device, commandEncoder, pipelines[322], layouts[322], infinityBuf, [buf_568, buf_564, buf_451, buf_453, buf_455, buf_569, buf_457], [13, 13, 1]);
        addComputePass(device, commandEncoder, pipelines[323], layouts[323], infinityBuf, [buf_570, buf_566, buf_471, buf_473, buf_475, buf_571, buf_477], [13, 13, 5]);
        addComputePass(device, commandEncoder, pipelines[324], layouts[324], infinityBuf, [buf_564, buf_568, buf_459, buf_461], [169, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[325], layouts[325], infinityBuf, [buf_566, buf_570, buf_479, buf_481], [169, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[326], layouts[326], infinityBuf, [buf_572, buf_496, buf_514, buf_564], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[327], layouts[327], infinityBuf, [buf_573, buf_543, buf_554, buf_566], [1183, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[328], layouts[328], infinityBuf, [buf_574, buf_496, buf_514, buf_564, buf_572], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[329], layouts[329], infinityBuf, [buf_575, buf_496, buf_514, buf_564, buf_572, buf_574, buf_483], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[330], layouts[330], infinityBuf, [buf_576, buf_0, buf_1, buf_2, buf_575], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[331], layouts[331], infinityBuf, [buf_577, buf_0, buf_1, buf_2, buf_575], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[332], layouts[332], infinityBuf, [buf_578, buf_576, buf_577, buf_485], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[333], layouts[333], infinityBuf, [buf_579, buf_576, buf_577, buf_485], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[334], layouts[334], infinityBuf, [buf_580, buf_576, buf_577, buf_485], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[335], layouts[335], infinityBuf, [buf_581, buf_576, buf_577, buf_485], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[336], layouts[336], infinityBuf, [buf_485, buf_573], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[337], layouts[337], infinityBuf, [buf_582, buf_485], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[338], layouts[338], infinityBuf, [buf_583, buf_573, buf_485, buf_486], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[339], layouts[339], infinityBuf, [buf_459, buf_582], [4, 2, 2]);
        addComputePass(device, commandEncoder, pipelines[340], layouts[340], infinityBuf, [buf_584, buf_487, buf_582], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[341], layouts[341], infinityBuf, [buf_585, buf_578, buf_579, buf_580, buf_581, buf_582, buf_583], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[342], layouts[342], infinityBuf, [buf_379, buf_459], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[343], layouts[343], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[344], layouts[344], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[345], layouts[345], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[346], layouts[346], infinityBuf, [buf_379, buf_459], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[347], layouts[347], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[348], layouts[348], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[349], layouts[349], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[350], layouts[350], infinityBuf, [buf_379, buf_459], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[351], layouts[351], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[352], layouts[352], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[353], layouts[353], infinityBuf, [buf_459, buf_379], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[354], layouts[354], infinityBuf, [buf_379, buf_459], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[355], layouts[355], infinityBuf, [buf_459, buf_379], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[356], layouts[356], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[357], layouts[357], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[358], layouts[358], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[359], layouts[359], infinityBuf, [buf_459, buf_379], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[360], layouts[360], infinityBuf, [buf_379, buf_459], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[361], layouts[361], infinityBuf, [buf_459, buf_379], [2, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[362], layouts[362], infinityBuf, [buf_379, buf_459], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[363], layouts[363], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[364], layouts[364], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[365], layouts[365], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[366], layouts[366], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[367], layouts[367], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[368], layouts[368], infinityBuf, [buf_379, buf_459], [4, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[369], layouts[369], infinityBuf, [buf_459, buf_379], [4, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[370], layouts[370], infinityBuf, [buf_379, buf_459], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[371], layouts[371], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[372], layouts[372], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[373], layouts[373], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[374], layouts[374], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[375], layouts[375], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[376], layouts[376], infinityBuf, [buf_379, buf_459], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[377], layouts[377], infinityBuf, [buf_459, buf_379], [8, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[378], layouts[378], infinityBuf, [buf_379, buf_459], [4, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[379], layouts[379], infinityBuf, [buf_459, buf_379], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[380], layouts[380], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[381], layouts[381], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[382], layouts[382], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[383], layouts[383], infinityBuf, [buf_459, buf_379], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[384], layouts[384], infinityBuf, [buf_379, buf_459], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[385], layouts[385], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[386], layouts[386], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[387], layouts[387], infinityBuf, [buf_459, buf_379], [8, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[388], layouts[388], infinityBuf, [buf_379, buf_459], [4, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[389], layouts[389], infinityBuf, [buf_459, buf_379], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[390], layouts[390], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[391], layouts[391], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[392], layouts[392], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[393], layouts[393], infinityBuf, [buf_459, buf_379], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[394], layouts[394], infinityBuf, [buf_379, buf_459], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[395], layouts[395], infinityBuf, [buf_459, buf_379], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[396], layouts[396], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[397], layouts[397], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[398], layouts[398], infinityBuf, [buf_379, buf_459], [8, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[399], layouts[399], infinityBuf, [buf_459, buf_379], [4, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[400], layouts[400], infinityBuf, [buf_379, buf_459], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[401], layouts[401], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[402], layouts[402], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[403], layouts[403], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[404], layouts[404], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[405], layouts[405], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[406], layouts[406], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[407], layouts[407], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[408], layouts[408], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[409], layouts[409], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[410], layouts[410], infinityBuf, [buf_379, buf_459], [8, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[411], layouts[411], infinityBuf, [buf_459, buf_379], [4, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[412], layouts[412], infinityBuf, [buf_379, buf_459], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[413], layouts[413], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[414], layouts[414], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[415], layouts[415], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[416], layouts[416], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[417], layouts[417], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[418], layouts[418], infinityBuf, [buf_379, buf_459], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[419], layouts[419], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[420], layouts[420], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[421], layouts[421], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[422], layouts[422], infinityBuf, [buf_379, buf_459], [8, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[423], layouts[423], infinityBuf, [buf_459, buf_379], [4, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[424], layouts[424], infinityBuf, [buf_379, buf_459], [2, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[425], layouts[425], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[426], layouts[426], infinityBuf, [buf_379, buf_459], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[427], layouts[427], infinityBuf, [buf_459, buf_379], [16, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[428], layouts[428], infinityBuf, [buf_379, buf_459], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[429], layouts[429], infinityBuf, [buf_459, buf_379], [64, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[430], layouts[430], infinityBuf, [buf_586, buf_487, buf_459], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[431], layouts[431], infinityBuf, [buf_587, buf_582, buf_459, buf_584, buf_586, buf_487], [1183, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[432], layouts[432], infinityBuf, [buf_588, buf_587], [25, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[433], layouts[433], infinityBuf, [buf_589, buf_585, buf_588, buf_487], [75, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[434], layouts[434], infinityBuf, [buf_590, buf_589], [25, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[435], layouts[435], infinityBuf, [buf_591, buf_589, buf_590], [75, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[436], layouts[436], infinityBuf, [output0, buf_589, buf_591], [75, 1, 1]);
        commandEncoder.copyBufferToBuffer(output0, 0, gpuReadBuffer0, 0, output0.size);
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);

        await gpuReadBuffer0.mapAsync(GPUMapMode.READ);
        const resultBuffer0 = new Float32Array(gpuReadBuffer0.size/4);
        resultBuffer0.set(new Float32Array(gpuReadBuffer0.getMappedRange()));
        gpuReadBuffer0.unmap();
        return [resultBuffer0];
    }
}
const load = async (device, weight_path) => { return await fetch(weight_path).then(x => x.arrayBuffer()).then(x => setupNet(device, new Uint8Array(x))); }
return { load, setupNet };
})();
export default yolov8;
