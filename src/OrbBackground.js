// OrbBackground.js
import React, { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

export default function OrbBackground() {
  const containerRef = useRef(null);

  // Vertex shader: pass through.
  const vertShader = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment shader: draws a wavy, glowing orb on a moving gradient background.
  const fragShader = /* glsl */ `
    precision highp float;
    
    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    
    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      
      // --- Moving Background Gradient ---
      // Compute normalized coordinates [0,1].
      vec2 normCoord = fragCoord / iResolution.xy;
      // Shift the gradient over time.
      float shift = mod(iTime * 0.1, 1.0);
      // Create a vertical gradient factor that loops.
      float gradientFactor = mod(normCoord.y + shift, 1.0);
      // Mix black and sky-blue (using a sky blue value: rgb(0.53, 0.81, 0.92)).
      vec3 bgColor = mix(vec3(0.0, 0.0, 0.0), vec3(0.53, 0.81, 0.92), gradientFactor);
      
      // --- Orb Effect ---
      vec2 center = iResolution.xy * 0.5;
      float minRes = min(iResolution.x, iResolution.y);
      // Normalize coordinates relative to the center.
      vec2 uv = (fragCoord - center) / minRes * 2.0;
      float r = length(uv);
      
      float baseRadius = 0.8;
      float wave = 0.05 * sin(uv.x * 10.0 + iTime * 2.0)
                 + 0.08 * cos(uv.y * 10.0 - iTime * 3.0);
      
      float outline = smoothstep(baseRadius + wave + 0.0000001, baseRadius + wave, r);
      float glow = 1.0 - smoothstep(baseRadius + wave - 0.0001, baseRadius + wave + 0.03, r);
      
      vec3 colorA = vec3(1.0, 0.5, 0.0);
      vec3 colorB = vec3(0.6, 1.0, 0.2);
      float t = clamp(hue / 360.0, 0.0, 1.0);
      vec3 glowColor = mix(colorA, colorB, t);
      
      vec3 orb = glowColor * glow;
      orb *= (1.0 - outline);
      float centerFade = smoothstep(0.0, baseRadius - 0.1, r);
      orb *= centerFade;
      
      // Combine the orb effect with the moving background.
      vec3 finalColor = bgColor + orb;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertShader,
      fragment: fragShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(gl.canvas.width, gl.canvas.height, 1) },
        hue: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 1);
    }
    window.addEventListener("resize", resize);
    resize();

    function update(t) {
      requestAnimationFrame(update);
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    requestAnimationFrame(update);

    // Optionally, update the hue on scroll.
    function handleScroll() {
      const newHue = Math.min(360, (window.scrollY / 1000) * 360);
      program.uniforms.hue.value = newHue;
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );
}
