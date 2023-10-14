import { Currency, ETHER, Token, WETH } from "@jediswap/sdk";
import React, {
  KeyboardEvent,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import { useAllTokens, useJediLPTokens, useToken } from "../../hooks/Tokens";
import { useSelectedListInfo } from "../../state/lists/hooks";
import { CloseIcon, LinkStyledButton, TYPE } from "../../theme";
import { isAddress } from "../../utils";
import Card from "../Card";
import Column from "../Column";
import ListLogo from "../ListLogo";
import QuestionHelper from "../QuestionHelper";
import Row, { RowBetween } from "../Row";
import CommonBases from "./CommonBases";
import CurrencyList from "./CurrencyList";
import { filterTokens } from "./filtering";
import SortButton from "./SortButton";
import { useTokenComparator } from "./sorting";
import { PaddedColumn, SearchInput, Separator } from "./styleds";
import AutoSizer from "react-virtualized-auto-sizer";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import { DEFAULT_CHAIN_ID, ChainIdStarknet } from "../../constants";
import { useAccountDetails } from "../../hooks";

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  onChangeList: () => void;
  showLPTokens?: boolean;
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList,
  showLPTokens = false
}: CurrencySearchProps) {
  const { t } = useTranslation();
  const { account, chainId } = useAccountDetails();

  const fixedList = useRef<FixedSizeList>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false);
  const allTokens = useAllTokens(chainId as ChainIdStarknet);
  const jediLPTokens = useJediLPTokens();

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: "Currency Select",
        action: "Search by address",
        label: isAddressSearch
      });
    }
  }, [isAddressSearch]);

  // const showETH: boolean = useMemo(() => {
  //   const s = searchQuery.toLowerCase().trim()
  //   return s === '' || s === 't' || s === 'to' || s === 'tok'
  // }, [searchQuery])

  const showTOKEN0: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();

    return s === "" || s === "e" || s === "et" || s === "eth";
  }, [searchQuery]);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) {
      if (searchToken) return [searchToken];
      else if (isAddressSearch === WETH[chainId ?? DEFAULT_CHAIN_ID].address) {
        const WETH = wrappedCurrency(ETHER, chainId);
        if (WETH) {
          return [WETH];
        }
        return [];
      }
      return [];
    }
    return filterTokens(
      Object.values(showLPTokens ? jediLPTokens : allTokens),
      searchQuery
    );
  }, [
    isAddressSearch,
    showLPTokens,
    jediLPTokens,
    allTokens,
    searchQuery,
    searchToken,
    chainId
  ]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect]
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback(event => {
    const input = event.target.value as string;
    const checksummedInput = input.startsWith("0x") ? isAddress(input) : false;
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const s = searchQuery.toLowerCase().trim();
        if (s === "token0") {
          handleCurrencySelect(ETHER);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() ===
              searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      } else if (e.key === "Backspace" && isAddressSearch) {
        setSearchQuery("");
      }
    },
    [filteredSortedTokens, handleCurrencySelect, isAddressSearch, searchQuery]
  );

  const selectedListInfo = useSelectedListInfo();

  return (
    <Column style={{ width: "100%", flex: "1 1" }}>
      <PaddedColumn gap="20px">
        <RowBetween>
          <Text fontWeight={400} fontSize={20} color={"#FFFFFF"}>
            {showLPTokens ? "Select LP Token" : "Select Token"}
            {/* <QuestionHelper text="Find a token by searching for its name or symbol or by pasting its address below." /> */}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <SearchInput
          type="text"
          id="token-search-input"
          placeholder={t("tokenSearchPlaceholder")}
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
        {showCommonBases && (
          <CommonBases
            chainId={chainId}
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
          />
        )}
        <RowBetween>
          <Text
            fontSize={16}
            fontWeight={700}
            fontFamily={"DM Sans"}
            letterSpacing={"0px"}
            color={"#FFFFFF"}
          >
            Token Name
          </Text>
          {/* <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} /> */}
        </RowBetween>
      </PaddedColumn>

      <Separator />

      <div style={{ flex: "1" }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              height={height}
              showETH={showTOKEN0 && !showLPTokens}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
            />
          )}
        </AutoSizer>
      </div>
    </Column>
  );
}
