precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D world;
uniform vec2 worldSize;

uniform sampler2D atlas;
uniform vec2 atlasSize;

uniform sampler2D mask;
uniform vec2 maskSize;

uniform float tileSize;

uniform float time;
uniform float bridgeId; // Bridges should not get blended
 
void main(void) {
    // Get position in mask texture.
    float maskRepeat = float(worldSize.x) * tileSize;
    float mx = mod(floor(vTextureCoord.x * maskRepeat), maskSize.x);
    float my = mod(floor(vTextureCoord.y * maskRepeat), maskSize.y);

    // Look up the required offset in the mask texture.
    vec4 offset = texture2D(mask, vec2(mx / maskSize.x, my / maskSize.y)) - 0.5;
    float x = vTextureCoord.x *  worldSize.x + offset.r;
    float y = vTextureCoord.y *  worldSize.y + offset.g;
    vec4 source = texture2D(world, vec2(x / worldSize.x, y / worldSize.y));

    // Convert the source an atlasId (can't index using the vec4 using [] so using if checks)
    float atlasId;
    float frame = mod(time + floor(x) + floor(y), 3.0);
    if (frame < 1.0) {
        atlasId = source.r * 255.0;
    } else if (frame < 2.0) {
        atlasId = source.g * 255.0;
    } else {
        atlasId = source.b * 255.0;
    }
    
    // Ensure bridges are not blended.
    float unblentAtlasId = floor(texture2D(world, vTextureCoord).r * 255.0);

    if (unblentAtlasId == bridgeId) {
        atlasId = unblentAtlasId;
    }

    if (atlasId == bridgeId) {
        atlasId = unblentAtlasId;
    }

    // Get number of atlas columns and rows.
    float atlasColumns = atlasSize.x / tileSize;
    float atlasRows = atlasSize.y / tileSize;

    // Get position in atlas texture.
    float dx = mod(atlasId, atlasColumns) / atlasColumns;
    float dy = floor(atlasId / atlasColumns) / atlasRows;

    // This is probably working by accident.
    vec2 size = tileSize / atlasSize;
    gl_FragColor = texture2D(atlas, vec2(dx, dy) + (mod((vTextureCoord * worldSize), 1.0) * size));
}
