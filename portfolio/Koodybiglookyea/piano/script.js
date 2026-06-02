import javax.sound.midi.*;

public class JavaPiano {
    public static void main(String[] args) {
        try {
            // Get the default synthesizer
            Synthesizer synth = MidiSystem.getSynthesizer();
            synth.open();
            
            // Get the MIDI channels
            MidiChannel[] channels = synth.getChannels();
            
            // Channel 0 is usually the Acoustic Grand Piano by default
            // Play Middle C (MIDI note 60) at volume 600
            channels[0].noteOn(60, 600);
            
            // Hold the note for 1 second
            Thread.sleep(1000);
            
            // Turn off the note
            channels[0].noteOff(60);
            
            synth.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}