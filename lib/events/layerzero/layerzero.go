package layerzero

import (
	"bytes"
	_ "embed"
	"fmt"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var (
	TopicPacketBurnt     = abi.Events["PacketBurnt"].ID
	TopicPacketDelivered = abi.Events["PacketDelivered"].ID
	TopicPacketNilified  = abi.Events["PacketNilified"].ID
	TopicPacketSent      = abi.Events["PacketSent"].ID
	TopicPacketVerified  = abi.Events["PacketVerified"].ID
)

type (
	EventPacketBurnt struct {
		events.Event

		SrcEid      uint32         `json:"src_eid"`
		Sender      events.Address `json:"sender"`
		Receiver    events.Address `json:"receiver"`
		Nonce       uint64         `json:"nonce"`
		PayloadHash events.Bytes   `json:"payload_hash"`
	}

	EventPacketDelivered struct {
		events.Event

		OriginSrcEid uint32         `json:"origin_src_eid"`
		OriginSender events.Bytes   `json:"origin_sender"`
		OriginNonce  uint64         `json:"origin_nonce"`
		Receiver     events.Address `json:"receiver"`
	}

	EventPacketNilified struct {
		events.Event

		SrcEid      uint32         `json:"src_eid"`
		Sender      events.Address `json:"sender"`
		Receiver    events.Address `json:"receiver"`
		Nonce       uint64         `json:"nonce"`
		PayloadHash events.Bytes   `json:"payload_hash"`
	}

	EventPacketSent struct {
		events.Event

		EncodedPayload events.Bytes   `json:"encoded_payload"`
		Options        events.Bytes   `json:"options"`
		SendLibrary    events.Address `json:"send_library"`
	}

	EventPacketVerified struct {
		events.Event

		OriginSrcEid uint32         `json:"origin_src_eid"`
		OriginSender events.Bytes   `json:"origin_sender"`
		OriginNonce  uint64         `json:"origin_nonce"`
		Receiver     events.Address `json:"receiver"`
		PayloadHash  events.Bytes   `json:"payload_hash"`
	}
)

func UnpackPacketBurnt(b []byte) (*EventPacketBurnt, error) {
	i, err := abi.Unpack("PacketBurnt", b)
	if err != nil {
		return nil, fmt.Errorf("unpack PacketBurnt: %v", err)
	}
	srcEid, ok := i[0].(uint32)
	if !ok {
		return nil, fmt.Errorf("srceid: %T", i[0])
	}
	sender, ok := i[1].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("sender: %T", i[1])
	}
	receiver, ok := i[2].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("receiver: %T", i[2])
	}
	nonce, ok := i[3].(uint64)
	if !ok {
		return nil, fmt.Errorf("nonce: %T", i[3])
	}
	payloadHash, ok := i[4].([32]byte)
	if !ok {
		return nil, fmt.Errorf("payloadHash: %T", i[4])
	}
	return &EventPacketBurnt{
		SrcEid:      srcEid,
		Sender:      addrToAddress(sender),
		Receiver:    addrToAddress(receiver),
		Nonce:       nonce,
		PayloadHash: events.BytesFromSlice(payloadHash[:]),
	}, nil
}

func UnpackPacketDelivered(b []byte) (*EventPacketDelivered, error) {
	var r struct {
		Origin struct {
			SrcEid uint32
			Sender [32]byte
			Nonce  uint64
		}
		Receiver ethCommon.Address
	}
	if err := abi.UnpackIntoInterface(&r, "PacketDelivered", b); err != nil {
		return nil, fmt.Errorf("unpack packetdelivered: %v", err)
	}
	return &EventPacketDelivered{
		OriginSrcEid: r.Origin.SrcEid,
		OriginSender: events.BytesFromSlice(r.Origin.Sender[:]),
		OriginNonce:  r.Origin.Nonce,
		Receiver:     addrToAddress(r.Receiver),
	}, nil
}

func UnpackPacketNilified(b []byte) (*EventPacketNilified, error) {
	i, err := abi.Unpack("PacketNilified", b)
	if err != nil {
		return nil, fmt.Errorf("unpack PacketNilified: %v", err)
	}
	srcEid, ok := i[0].(uint32)
	if !ok {
		return nil, fmt.Errorf("srceid: %T", i[0])
	}
	sender, ok := i[1].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("sender: %T", i[1])
	}
	receiver, ok := i[2].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("receiver: %T", i[2])
	}
	nonce, ok := i[3].(uint64)
	if !ok {
		return nil, fmt.Errorf("nonce: %T", i[3])
	}
	payloadHash, ok := i[4].([32]byte)
	if !ok {
		return nil, fmt.Errorf("payloadHash: %T", i[4])
	}
	return &EventPacketNilified{
		SrcEid:      srcEid,
		Sender:      addrToAddress(sender),
		Receiver:    addrToAddress(receiver),
		Nonce:       nonce,
		PayloadHash: events.BytesFromSlice(payloadHash[:]),
	}, nil
}

func UnpackPacketSent(b []byte) (*EventPacketSent, error) {
	i, err := abi.Unpack("PacketSent", b)
	if err != nil {
		return nil, fmt.Errorf("unpack PacketSent: %v", err)
	}
	encodedPayload, ok := i[0].([]byte)
	if !ok {
		return nil, fmt.Errorf("encodedPayload: %T", i[0])
	}
	options, ok := i[1].([]byte)
	if !ok {
		return nil, fmt.Errorf("options: %T", i[1])
	}
	sendLibrary, ok := i[2].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("sendLibrary: %T", i[1])
	}
	return &EventPacketSent{
		EncodedPayload: events.BytesFromSlice(encodedPayload),
		Options:        events.BytesFromSlice(options),
		SendLibrary:    addrToAddress(sendLibrary),
	}, nil
}

func UnpackPacketVerified(b []byte) (*EventPacketVerified, error) {
	var r struct {
		Origin struct {
			SrcEid uint32
			Sender [32]byte
			Nonce  uint64
		}
		Receiver    ethCommon.Address
		PayloadHash [32]byte
	}
	if err := abi.UnpackIntoInterface(&r, "PacketVerified", b); err != nil {
		return nil, fmt.Errorf("unpack packetverified: %v", err)
	}
	return &EventPacketVerified{
		OriginSrcEid: r.Origin.SrcEid,
		OriginSender: events.BytesFromSlice(r.Origin.Sender[:]),
		OriginNonce:  r.Origin.Nonce,
		Receiver:     addrToAddress(r.Receiver),
		PayloadHash:  events.BytesFromSlice(r.PayloadHash[:]),
	}, nil
}

func addrToAddress(h ethCommon.Address) events.Address {
	return events.AddressFromString(h.String())
}

func init() {
	if abiErr != nil {
		panic(abiErr)
	}
}
