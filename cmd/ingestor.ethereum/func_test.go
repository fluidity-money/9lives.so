package main

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/events/layerzero"
	"github.com/fluidity-money/9lives.so/lib/types/events"

	"github.com/stretchr/testify/assert"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethTypes "github.com/ethereum/go-ethereum/core/types"
)

func testIngestorArgs(x ethCommon.Address) IngestorArgs {
	return IngestorArgs{x, x, x, x, x, x, x, x}
}

func testIngestorArgsZero() IngestorArgs {
	return testIngestorArgs(ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"))
}

func TestTopicsAreOkay(t *testing.T) {
	var z [32]byte
	assert.NotContains(t, z[:], FilterTopics)
}

func TestSharesMinted(t *testing.T) {
	s := strings.NewReader(`{

	"address": "0xc0393bb76c72378eb59ae5690c71efb62a420921",
	"blockHash": "0xf26f344ba9dae977f41b158cac2bc0cbb3735104b3ddd0c95dc4b10704a33bd6",
	"blockNumber": "0x10257f68",
	"data": "0x0000000000000000000000007bf28d75b4179dd6a0000c66f6b2c0502efd0b780000000000000000000000000000000000000000000000000000000001312d00",
	"logIndex": "0x5",
	"removed": false,
	"topics": [
		"0x67c2067005f9aaa672cf0d349c477d4d5e9d7578bca4789a839f84c669fe0b31",
		"0x1b8fb68f7c2e19b8000000000000000000000000000000000000000000000000",
		"0x00000000000000000000000000000000000000000000000000000000028511e1",
		"0x0000000000000000000000007bf28d75b4179dd6a0000c66f6b2c0502efd0b78"
	],
	"transactionHash": "0x5bb7f89dee759331faccf4af48a2295bce9040dcc283dc51d099b9ba294860dd",
	"transactionIndex": "0x2"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")

	handleLogCallback(
		testIngestorArgs(factoryAddr),
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return addr == "0xc0393bb76c72378eb59ae5690c71efb62a420921", nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "ninelives_events_shares_minted", table, "table not equal")
			_, ok := a.(*events.EventSharesMinted)
			assert.Truef(t, ok, "SharesMinted type coercion not true")
			wasRun = true
			return nil
		})
	assert.True(t, wasRun)
}

func TestOutcomeDecided(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0xc515931083dda1edba5bb4e0555b83c7a84a22c7",
	"blockHash": "0x4c59198fc91af68c6663bf96b8f4d72a95ca2360c5da0beb6aad7b092de2c47e",
	"blockNumber": "0xf28b9",
	"data": "0x",
	"logIndex": "0x0",
	"removed": false,
	"topics": [
		"0x346cb28308c5aa92dbbc3370b3e3f02f23b4feb3ed394ac97cdf989c092ba46c",
		"0x6d53a60a1a325a2f000000000000000000000000000000000000000000000000",
		"0x0000000000000000000000009d73847f1edc930d2a2ee801aeadb4c4567f18e1"
	],
	"transactionHash": "0xc0fe3856a3e5c2c1ab1920139a63c71c1f1ea7639e86f1d87721d3d6246a9581",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")

	_, err := handleLogCallback(
		testIngestorArgs(factoryAddr),
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "ninelives_events_outcome_decided", table, "table not equal")
			_, ok := a.(*events.EventOutcomeDecided)
			assert.Truef(t, ok, "EventOutcomeDecided type coercion not true")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestLifiGenericSwapCompleted(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0x03d55a7896097801b1de90b4e3e0392ce279180a",
	"blockHash": "0xcbb276f172e0d4b444e829fabc14c57a92b12d88ad5dd7e8d3dfafa4bab9ff61",
	"blockNumber": "0x19e451",
	"data": "0x00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e700000000000000000000000000000000000000000000000000000000000000000000000000000000000000006c030c5cc283f791b26816f325b9c632d964f8a100000000000000000000000000000000000000000000000000352b7d97161ad80000000000000000000000000000000000000000000000000000000002371da7000000000000000000000000000000000000000000000000000000000000000e6e6578746a732d6578616d706c65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30783030303030303030303030303030303030303030303030303030303030303030303030303030303000000000000000000000000000000000000000000000",
	"logIndex": "0x9",
	"removed": false,
	"topics": [
		"0x38eee76fd911eabac79da7af16053e809be0e12c8637f156e77e1af309b99537",
		"0xe2ae770feb1e1259be2202f1f786013e6349604de44cb9cbbc0dab7184a1061d"
	],
	"transactionHash": "0x54607f676bf0f1fa47cadec765113cf89dc3664fa7416bfbc8ed08fac19f2a31",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	lifiDiamond := ethCommon.HexToAddress("0x03d55A7896097801B1dE90b4E3E0392CE279180A")
	_, err := handleLogCallback(
		IngestorArgs{LifiDiamond: lifiDiamond},
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "lifi_events_generic_swap_completed", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestStargateOFTReceived(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0x8ee21165ecb7562ba716c9549c1de751282b9b33",
	"blockHash": "0x0ffa0e15b5e1b39cee90af47388b6cb714071313919fe196ffa2c53a7fce1e4f",
	"blockNumber": "0x1a8166",
	"data": "0x000000000000000000000000000000000000000000000000000000000000759e0000000000000000000000000000000000000000000000000000000000e20554",
	"logIndex": "0x2",
	"removed": false,
	"topics": [
		"0xefed6d3500546b29533b128a29e3a94d70788727f0507505ac12eaf2e578fd9c",
		"0x667da173724a06521ddf40c31096fccabcb314fc91e8892d53dfe3f1837d12bd",
		"0x00000000000000000000000012feae999fabba4b0086a257c9c5e350e62da0c9"
	],
	"transactionHash": "0xbed0282259ed65aa578c3d3dea59223b0a7fad583270cacfefc50c056de42969",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		testIngestorArgsZero(),
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "stargate_events_stargate_oft_received", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestOnchainGm(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0x8510ac40bea1b4261c0b08100f5bff186a00388c",
	"blockHash": "0x5776b1559fb4e627855cd65f92a40ac616790d81cc78a690dc1ad3e353381690",
	"blockNumber": "0x1cd01b",
	"data": "0x",
	"logIndex": "0x0",
	"removed": false,
	"topics": [
		"0x9290e8f5ba7fa69269d601e86762855088f9a24d834db4d6b3e603d7a522e56a",
		"0x00000000000000000000000078a2beebd9a01461662a56c397c74bd4356bd61b",
		"0x0000000000000000000000000000000000000000000000000000000000000000"
	],
	"transactionHash": "0x97a44120cbd43d4a256ef656a94240ed43365144e3e088253f57e8202d45fb08",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		testIngestorArgsZero(),
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "onchaingm_events_onchaingmevent", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestLayerzeroPacketDelivered(t *testing.T) {
	s := strings.NewReader(`{
		"address": "0x6f475642a6e85809b1c36fa62763669b1b48dd5b",
		"blockHash": "0xae142369c9aca0f0bc5bd75edca2e4f1c398990491ce24f881012c8499dd3866",
		"blockNumber": "0x1d74ee",
		"data": "0x00000000000000000000000000000000000000000000000000000000000075e80000000000000000000000005634c4a5fed09819e3c46d86a965dd9447d86e4700000000000000000000000000000000000000000000000000000000000032e000000000000000000000000006eb48763f117c7be887296cdcdfad2e4092739c",
		"logIndex": "0x6",
		"removed": false,
		"topics": [
			"0x3cd5e48f9730b129dc7550f0fcea9c767b7be37837cd10e55eb35f734f4bca04"
		],
		"transactionHash": "0x48f8637fd6175b93e9e6784c91653a5fc136f0b1ff53e426696d1b72c6acf968",
		"transactionIndex": "0x1"
	}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		IngestorArgs{
			Layerzero: ethCommon.HexToAddress("0x6f475642a6e85809b1c36fa62763669b1b48dd5b"),
		},
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "layerzero_events_packet_delivered", table, "table not equal")
			p, _ := a.(*layerzero.EventPacketDelivered)
			assert.Equal(t, uint32(30184), p.OriginSrcEid)
			assert.Equal(t,
				"0000000000000000000000005634c4a5fed09819e3c46d86a965dd9447d86e47",
				p.OriginSender.String(),
			)
			assert.Equal(t, uint64(13024), p.OriginNonce)
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestLayerzeroPacketSent(t *testing.T) {
	s := strings.NewReader(`{
		"address": "0x6f475642a6e85809b1c36fa62763669b1b48dd5b",
		"blockHash": "0x06895f5c23b4f8f284a71cabe8c38c1aeabc4ed5e03641e860c5929c7c05090c",
		"blockNumber": "0x1d74c5",
		"data": "0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000140000000000000000000000000c39161c743d0307eb9bcc9fef03eeb9dc4802de700000000000000000000000000000000000000000000000000000000000000bd010000000000000cac0000767700000000000000000000000006eb48763f117c7be887296cdcdfad2e4092739c0000759f000000000000000000000000f1fcb4cbd57b67d683972a59b6a7b1e2e8bf27e6314aadf7bd79cd2deabf3ecdbf306df0f53934691c42d22667d8acc01324079d0200000000000000000000000000000000000000000000000000001b48eb57e0000001000000000000000000000000d0319771f95375b161006fb2481fde74eb80ccf4000000000502804700000000000000000000000000000000000000000000000000000000000000000000002a0003010011010000000000000000000000000000c350010011010000000000000000000000000000d6d800000000000000000000000000000000000000000000",
		"logIndex": "0x2",
		"removed": false,
		"topics": [
			"0x1ab700d4ced0c005b164c0f789fd09fcbb0156d4c2041b8a3bfbcd961cd1567f"
		],
		"transactionHash": "0x4842504634edb75c4146d572bed11e8945de668d2889447aa43aa6e605c2c788",
		"transactionIndex": "0x1"
	}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		IngestorArgs{
			Layerzero: ethCommon.HexToAddress("0x6f475642a6e85809b1c36fa62763669b1b48dd5b"),
		},
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "layerzero_events_packet_sent", table, "table not equal")
			p, _ := a.(*layerzero.EventPacketSent)
			assert.Equal(t,
				"010000000000000cac0000767700000000000000000000000006eb48763f117c7be887296cdcdfad2e4092739c0000759f000000000000000000000000f1fcb4cbd57b67d683972a59b6a7b1e2e8bf27e6314aadf7bd79cd2deabf3ecdbf306df0f53934691c42d22667d8acc01324079d0200000000000000000000000000000000000000000000000000001b48eb57e0000001000000000000000000000000d0319771f95375b161006fb2481fde74eb80ccf4000000000502804700",
				p.EncodedPayload.String(),
			)
			assert.Equal(t,
				"0003010011010000000000000000000000000000c350010011010000000000000000000000000000d6d8",
				p.Options.String(),
			)
			assert.Equal(t,
				"0xc39161c743d0307eb9bcc9fef03eeb9dc4802de7",
				p.SendLibrary.String(),
			)
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestLayerzeroPacketVerified(t *testing.T) {
	s := strings.NewReader(`{
		"address": "0x6f475642a6e85809b1c36fa62763669b1b48dd5b",
		"blockHash": "0x244816652f9a0cbe0954ae7c3b6de8ca67045f262573401b665ff89651268b70",
		"blockNumber": "0x1d747d",
		"data": "0x000000000000000000000000000000000000000000000000000000000000759e000000000000000000000000896e3a0f5c499c72ded0cd59a6c0162a5172c1e40000000000000000000000000000000000000000000000000000000000002155000000000000000000000000cee9b58c2cdb01b8bf75a27e96ec09bf885ef55ad8bf06400f12b0a4da2c4fa069b04b6106d52f5bdb2c0db14a0cd89e95b16578",
		"logIndex": "0x0",
		"removed": false,
		"topics": [
			"0x0d87345f3d1c929caba93e1c3821b54ff3512e12b66aa3cfe54b6bcbc17e59b4"
		],
		"transactionHash": "0x1d9a583ccc1a1706d58e77f098186089e651c13991d9f138fb801a9e57b77858",
		"transactionIndex": "0x1"
	}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		IngestorArgs{
			Layerzero: ethCommon.HexToAddress("0x6f475642a6e85809b1c36fa62763669b1b48dd5b"),
		},
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "layerzero_events_packet_verified", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestVendorBorrow(t *testing.T) {
	s := strings.NewReader(`{
		"address": "0x389dbaad12259f5865b63c52eb254ed9231e5476",
		"blockHash": "0x8167878bc26b91ac6664ab6e3166a6a086ca2da1f9f7a7b7297828ac584d79a3",
		"blockNumber": "0x1d8c8e",
		"data": "0x00000000000000000000000000000000000000000000000000000c4736b45800000000000000000000000000000000000000000000000000000051dac207a0000000000000000000000000000000000000000000000000000000000000004e200000000000000000000000000000000000000000000000000011c37937e08000000000000000000000000000000000000000000000000000000ffcb9e57d4000",
		"logIndex": "0x6",
		"removed": false,
		"topics": [
			"0x1f1f246d28cf134f9cd6749340babdf184db7363b6754c5de8fd9ecf4b410cc7",
			"0x00000000000000000000000088769789657055e5629b758124f3bc52f218a2c5"
		],
		"transactionHash": "0x244302dd8baa554b0f9848860f913c97e28a0325786510e8667dc1147f09a1c6",
		"transactionIndex": "0x1"
	}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		testIngestorArgsZero(),
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "vendor_events_borrow", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestSudoswapPairCreated(t *testing.T) {
	s := strings.NewReader(`{
		"address": "0x705fd2868348df3ea3f560e52b00c4c3df6aeed2",
		"blockHash": "0x1ab51a48d6230dfa4da55786f77fb11bbad0e3cc6b4276d17b54f84aaf071e45",
		"blockNumber": "0x1eec55",
		"data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002",
		"logIndex": "0x1",
		"removed": false,
		"topics": [
			"0xe8e1cee58c33f242c87d563bbc00f2ac82eb90f10a252b0ba8498ae6c1dc241a",
			"0x00000000000000000000000043c1fd85f31af0becedf748c5987f6d5c65d53cd"
		],
		"transactionHash": "0xfe92e31920441df3de2055170505ee0ac7bd07dbabb5b8c19787f2dc538655e0",
		"transactionIndex": "0x1"
	}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	_, err := handleLogCallback(
		testIngestorArgs(ethCommon.HexToAddress("0x705fd2868348df3ea3f560e52b00c4c3df6aeed2")),
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "sudoswap_new_erc721pair", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}
