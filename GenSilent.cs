using System;
using System.IO;

public class ProgramWav {
    public static void Create() {
        int sampleRate = 1; // 1 byte per second!
        int duration = 7200; // 2 hours
        int numSamples = sampleRate * duration;
        byte[] bytes = new byte[numSamples];
        // 128 is "silence" in 8-bit unsigned Audio
        for(int i=0; i<bytes.Length; i++) bytes[i] = 128;

        using (FileStream fs = new FileStream("assets/audio/silence.wav", FileMode.Create))
        using (BinaryWriter bw = new BinaryWriter(fs)) {
            bw.Write(new char[] { 'R', 'I', 'F', 'F' });
            bw.Write(36 + numSamples);
            bw.Write(new char[] { 'W', 'A', 'V', 'E' });
            bw.Write(new char[] { 'f', 'm', 't', ' ' });
            bw.Write(16);
            bw.Write((short)1);
            bw.Write((short)1);
            bw.Write(sampleRate);
            bw.Write(sampleRate);
            bw.Write((short)1);
            bw.Write((short)8);
            bw.Write(new char[] { 'd', 'a', 't', 'a' });
            bw.Write(numSamples);
            bw.Write(bytes);
        }
    }
}
