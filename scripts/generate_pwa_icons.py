import math
import zlib
import struct
import os

def create_png(width, height, is_maskable=False):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    # width (4), height (4), bit depth (1), color type 6=RGBA (1), compression (1), filter (1), interlace (1)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    raw_rows = []
    
    radius_scale = 0.58 if is_maskable else 0.72
    corner_radius = 0.0 if is_maskable else 0.44
    
    colors = [
        (56, 189, 248),   # cyan
        (236, 72, 153),   # pink
        (250, 204, 21),   # yellow
        (239, 68, 68),    # red
        (255, 255, 255),  # white
        (56, 189, 248),   # cyan
    ]
    
    for y in range(height):
        row = bytearray([0]) # filter type 0 (None)
        ny = (y / (height - 1)) * 2.0 - 1.0
        
        for x in range(width):
            nx = (x / (width - 1)) * 2.0 - 1.0
            
            # Squircle / rounded box test
            if not is_maskable:
                # Rounded rect distance
                ax = max(0.0, abs(nx) - (1.0 - corner_radius))
                ay = max(0.0, abs(ny) - (1.0 - corner_radius))
                corner_dist = math.sqrt(ax * ax + ay * ay)
                if corner_dist > corner_radius:
                    row.extend([0, 0, 0, 0])
                    continue
            
            # Background gradient from purple to violet
            t = (nx + ny + 2.0) / 4.0
            t = max(0.0, min(1.0, t))
            bg_r = int(76 * (1.0 - t) + 139 * t)
            bg_g = int(29 * (1.0 - t) + 92 * t)
            bg_b = int(149 * (1.0 - t) + 246 * t)
            
            # Swirl candy in center
            dist = math.sqrt(nx * nx + ny * ny)
            
            if dist <= radius_scale:
                # Inside lollipop
                if dist <= radius_scale * 0.25:
                    # Inner center core
                    if dist <= radius_scale * 0.09:
                        r, g, b = (250, 204, 21) # yellow core
                    elif dist <= radius_scale * 0.17:
                        r, g, b = (244, 63, 94)  # rose circle
                    else:
                        r, g, b = (255, 255, 255) # white ring
                else:
                    # Swirl spiral arms
                    angle = math.atan2(ny, nx)
                    swirl_angle = (angle + dist * 3.5) % (2.0 * math.pi)
                    if swirl_angle < 0:
                        swirl_angle += 2.0 * math.pi
                    
                    arm_idx = int((swirl_angle / (2.0 * math.pi)) * 6) % 6
                    r, g, b = colors[arm_idx]
                
                # Smooth outer circle antialiasing edge
                edge = (radius_scale - dist) / (2.0 / min(width, height))
                if edge < 1.0 and edge > 0.0:
                    r = int(r * edge + bg_r * (1.0 - edge))
                    g = int(g * edge + bg_g * (1.0 - edge))
                    b = int(b * edge + bg_b * (1.0 - edge))
            else:
                r, g, b = bg_r, bg_g, bg_b
            
            row.extend([r, g, b, 255])
        
        raw_rows.append(bytes(row))
    
    # IDAT chunk
    compressed_data = zlib.compress(b''.join(raw_rows), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    png += struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    return png

os.makedirs('public', exist_ok=True)

with open('public/pwa-192x192.png', 'wb') as f:
    f.write(create_png(192, 192, False))
print("Generated pwa-192x192.png")

with open('public/pwa-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, False))
print("Generated pwa-512x512.png")

with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, True))
print("Generated pwa-maskable-512x512.png")

with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(create_png(180, 180, False))
print("Generated apple-touch-icon.png")

with open('public/favicon.ico', 'wb') as f:
    # 32x32 standard favicon
    f.write(create_png(32, 32, False))
print("Generated favicon.ico")
