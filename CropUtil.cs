using System;
using System.Drawing;
using System.Drawing.Imaging;

public class Cropper {
    public static void CropImage(string src, string dst) {
        using(Bitmap bmp = new Bitmap(src)) {
            // Check original
            Console.WriteLine("Original: " + bmp.Width + "x" + bmp.Height);

            int left = bmp.Width, top = bmp.Height, right = 0, bottom = 0;
            for(int y = 0; y < bmp.Height; y++) {
                for(int x = 0; x < bmp.Width; x++) {
                    Color c = bmp.GetPixel(x,y);
                    // Since it has dark bg or transparent bg, let's treat anything not close to black/transparent as content.
                    // Actually, if it's transparent, we check alpha. If it has a solid black background, we check brightness.
                    // The screenshot shows a black background OR transparent. Let's assume transparent or almost-black are padding.
                    if(c.A > 10 && (c.R > 15 || c.G > 15 || c.B > 15)) {
                        if(x < left) left = x;
                        if(x > right) right = x;
                        if(y < top) top = y;
                        if(y > bottom) bottom = y;
                    }
                }
            }
            if(right < left || bottom < top) {
                // Failsafe: if everything was "ignored", don't crop or just crop center 50%
                left = bmp.Width / 4;
                right = bmp.Width * 3 / 4;
                top = bmp.Height / 4;
                bottom = bmp.Height * 3 / 4;
            }

            int padding = 20;
            left = Math.Max(0, left - padding);
            top = Math.Max(0, top - padding);
            right = Math.Min(bmp.Width - 1, right + padding);
            bottom = Math.Min(bmp.Height - 1, bottom + padding);
            int width = Math.Max(1, right - left + 1);
            int height = Math.Max(1, bottom - top + 1);
            
            // Make square
            int dim = Math.Max(width, height);
            int nx = left - (dim - width) / 2;
            int ny = top - (dim - height) / 2;
            nx = Math.Max(0, nx);
            ny = Math.Max(0, ny);
            dim = Math.Min(dim, Math.Min(bmp.Width - nx, bmp.Height - ny));
            if (dim <= 0) dim = Math.Min(bmp.Width, bmp.Height) / 2;

            Console.WriteLine("Crop Rect: " + nx + "," + ny + " " + dim + "x" + dim);

            Rectangle cropRect = new Rectangle(nx, ny, dim, dim);
            using(Bitmap target = new Bitmap(cropRect.Width, cropRect.Height)) {
                // Ensure transparency
                target.MakeTransparent();
                using(Graphics g = Graphics.FromImage(target)) {
                    g.Clear(Color.Transparent);
                    g.DrawImage(bmp, new Rectangle(0, 0, target.Width, target.Height), cropRect, GraphicsUnit.Pixel);
                }
                target.Save(dst, ImageFormat.Png);
            }
            Console.WriteLine("Done cropping to " + dst);
        }
    }
}
