const vertexShader =  `#version 300 es
precision mediump float;
in vec2 a_pTexCord;
in vec3 vPosition;
in vec3 vNormal;

uniform vec4 AmbientProduct, DiffuseProduct, SpecularProduct;
uniform float shininess;

uniform float perFragment;
uniform vec3 lightPosition;
uniform vec3 viewPosition;
uniform float mod;
uniform float theta;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

out vec3 normal;
out vec3 surfaceToLight;
out vec3 surfaceToView;
out vec2 v_pTexCord;
out mediump vec4 vColor;
out mediump vec3 fN;
out mediump vec3 fV;
out mediump vec3 fL;

void main()
{
    normal = (normalMatrix * vec4(vNormal, 1.0)).xyz;
    vec3 pos = (modelViewMatrix *vec4(vPosition, 1.0)).xyz;
    surfaceToLight = lightPosition - pos;
    surfaceToView =  viewPosition - pos;
    gl_Position = projectionMatrix*modelViewMatrix*vec4(vPosition, 1.0);
    v_pTexCord = a_pTexCord;

    if (perFragment == 1.0)
    {
        vec3 L = normalize(lightPosition - pos);
        vec3 V = normalize(-pos);
        vec3 H = normalize(L + V);
        vec4 ambient = AmbientProduct;
        float Fd = max(dot(L, normal), 0.0);
        vec4 diffuse = Fd*DiffuseProduct;
        float Fs = pow(max(dot(normal, H), 0.0), shininess);
        vec4 specular = Fs * SpecularProduct;
        if( dot(L, normal) < 0.0 )
            specular = vec4(0.0, 0.0, 0.0, 1.0);
        
        vColor = ambient + diffuse + specular;
        vColor.a = 1.0;
    }
    else if (perFragment == -1.0)
    {
        fN = normal;
        fV = -pos;
        fL = lightPosition + fV;
    }

}`;


const fragmentShader= `#version 300 es

precision mediump float;
in vec2 v_pTexCord;
in vec3 normal, surfaceToLight;
in vec3 surfaceToView;
in vec4 vColor;
in mediump vec3 fN;
in mediump vec3 fL;
in mediump vec3 fV;
//in float vLight;
uniform vec4 AmbientProduct, DiffuseProduct, SpecularProduct;
uniform float mod;
uniform sampler2D u_image0;
uniform sampler2D u_image1;
uniform vec3 lightDirection;
uniform float shininess;
uniform float innerLimit;
uniform float outerLimit;
uniform float perFragment;

out vec4 outColor;

void
main()
{
    vec3 V = normalize(normal);
    vec3 L = normalize(lightDirection);
    vec3 surfaceToLightDirection = normalize(surfaceToLight);
    vec3 surfaceToViewDirection = normalize(surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float dotFromDirection = dot(surfaceToLightDirection, -L);
    float inLight = smoothstep(outerLimit, innerLimit, dotFromDirection);
    float light = inLight * dot(normal, surfaceToLightDirection);

    if (mod == 1.0) {
        outColor = texture(u_image0, v_pTexCord);
    }
    else {
        outColor = texture(u_image1, v_pTexCord);
    }
    if (perFragment == 1.0)
    {
        outColor *= vColor;
        outColor.rgb *= light;
    }
    else if (perFragment == -1.0)
    {
        
        vec3 N = normalize(fN);
        vec3 VV = normalize(fV);
        vec3 LL = normalize(fL);
        vec3 H = normalize( LL + VV );
        vec4 ambient = AmbientProduct;
        float Kd = max(dot(LL, N), 0.0);
        vec4 diffuse = Kd*DiffuseProduct;
        float Ks = pow(max(dot(N, H), 0.0), shininess);
        vec4 specular = Ks*SpecularProduct;
        // discard the specular highlight if the light's behind the vertex
        if( dot(LL, N) < 0.0 )
            specular = vec4(0.0, 0.0, 0.0, 1.0);
        vec4 fColor= ambient + diffuse + specular;
        fColor.a = 1.0;
        outColor *= fColor;
        outColor.rgb *= light;
    }
    else 
    {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    
   
}`;
