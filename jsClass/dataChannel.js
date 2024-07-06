

class DataChannel{
    datachannel = null;
    constructor(pc,label) {
        this.datachannel = pc.createDataChannel(label);
    }

}