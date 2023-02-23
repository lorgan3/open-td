#version 300 es

precision highp float;

in vec2 vTextureCoord;
uniform sampler2D world;
uniform sampler2D atlas;
uniform sampler2D mask;

uniform float tileSize;
uniform bool textured;
uniform bool blended;
uniform float time;

uniform int bridgeId; // Bridges should not get blended

out vec4 fragmentColor;

void main(){
    // Get dimemsions of all textures.
	highp ivec2 worldSize = textureSize(world, 0);
    highp ivec2 maskSize = textureSize(mask, 0);
    highp ivec2 atlasSize = textureSize(atlas, 0);

    // Get number of atlas columns and rows.
    int atlasColumns = atlasSize.x / int(tileSize);
    int atlasRows = atlasSize.y / int(tileSize);

    // Get position in world texture.
    float wx = vTextureCoord.x * float(worldSize.x);
    float wy = vTextureCoord.y * float(worldSize.y);
    
    // Get position in mask texture.
    float maskRepeat = float(worldSize.x) * tileSize;

    vec4 maskTexel = vec4(0.5);
    if (blended) {
        int mx = int(floor(vTextureCoord.x * maskRepeat)) % maskSize.x;
        int my = int(floor(vTextureCoord.y * maskRepeat)) % maskSize.y;
        maskTexel = texelFetch(mask, ivec2(mx, my), 0);
    }

    // Get atlas id from word texture: world position + mask offset.
    int x = int(floor(wx + (maskTexel.r - 0.5)));
	int y = int(floor(wy + (maskTexel.g - 0.5)));
	int atlasId = int(texelFetch(world, ivec2(x, y), 0)[int(mod(time + float(x) + float(y), 3.0))] * 255.0);

    int unblentAtlasId = int(texelFetch(world, ivec2(int(floor(wx)), int(floor(wy))), 0)[int(mod(time + float(x) + float(y), 3.0))] * 255.0);

    if (unblentAtlasId == bridgeId) {
        atlasId = unblentAtlasId;
    }

    if (atlasId == bridgeId) {
        atlasId = unblentAtlasId;
    }

    if (!textured) {
         wx = floor(wx / tileSize) * tileSize;
         wy = floor(wy / tileSize) * tileSize;
    }

    // Get position in atlas texture.
    float dx = (mod(wx, 1.0) + float(atlasId % atlasColumns)) / float(atlasColumns);
    float dy = (mod(wy, 1.0) + float(atlasId / atlasColumns)) / float(atlasRows);
    ivec2 atlasPos = ivec2(int(dx * float(atlasSize.x)), int(dy * float(atlasSize.y)));

    fragmentColor = texelFetch(atlas, atlasPos, 0);
}
