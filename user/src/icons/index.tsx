/* eslint-disable react/require-default-props */
import Icon from '@ant-design/icons';
import { CSSProperties } from 'react';

interface IIcons {
  style?: CSSProperties;
  rotate?: number;
  spin?: boolean;
  className?: string;
}

function ModelSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 28 28">
      <path id="call-center-agent" d="M51.14,20.906a9.759,9.759,0,0,0,1.414-5.048V9.672c-.536-12.9-18.913-12.891-19.444,0v6.187a9.759,9.759,0,0,0,1.414,5.048,8.085,8.085,0,0,0-4.949,7.443V30H56.089V28.35A8.085,8.085,0,0,0,51.14,20.906ZM34.877,9.672c.438-10.555,15.475-10.547,15.909,0v6.187a7.859,7.859,0,0,1-1.417,4.533,8.09,8.09,0,0,0-1.352-.114h-1.65v-2a6.184,6.184,0,0,0,2.651-5.074V10.6l-.787-.087a7.06,7.06,0,0,1-6.209-6L41.87,3.468l-1,.335a6.18,6.18,0,0,0-4.223,5.868v3.535a6.213,6.213,0,0,0,.063.884H34.877V9.672Zm7.954,7.954A4.415,4.415,0,0,1,39.3,15.858h0a2.55,2.55,0,0,1-.537-.841c-.3-.867-.261-.927-.261-.927h0a4.422,4.422,0,0,1-.089-.884V9.672a4.415,4.415,0,0,1,2.1-3.766,8.832,8.832,0,0,0,6.735,6.24v1.061A4.424,4.424,0,0,1,42.831,17.626Zm0,1.768a6.168,6.168,0,0,0,1.768-.258v1.142a1.768,1.768,0,0,1-3.535,0V19.136A6.166,6.166,0,0,0,42.831,19.394ZM39.96,26.762,37.908,24.71l1.712-1.642Zm1.477-3.236a3.556,3.556,0,0,0,2.787,0l-.431,4.705H41.87Zm4.6-.458,1.714,1.642L45.7,26.763Zm-11.164-7.21h2.365A6.229,6.229,0,0,0,39.3,18.281v2h-1.65a8.09,8.09,0,0,0-1.352.114A7.859,7.859,0,0,1,34.877,15.858Zm2.769,6.187h.487l-2.752,2.638,3.549,3.549H31.343A6.312,6.312,0,0,1,37.646,22.045Zm9.087,6.187,3.549-3.549-2.753-2.638h.488a6.312,6.312,0,0,1,6.3,6.187Z" transform="translate(-26.574 1)" />
    </svg>
  );
}

function HomeSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 28 28">
      <path d="M29,13.82a1,1,0,0,0-.37-.77l-12-9.82a1,1,0,0,0-1.26,0l-12,9.82a1,1,0,0,0-.37.77,1,1,0,0,0,1,1,.94.94,0,0,0,.63-.23L6,13.47V24.2A2.81,2.81,0,0,0,8.8,27h2.9a2.81,2.81,0,0,0,2.8-2.8V22.8a.8.8,0,0,1,.8-.8h1.4a.8.8,0,0,1,.8.8v1.4A2.81,2.81,0,0,0,20.3,27h2.9A2.81,2.81,0,0,0,26,24.2V13.47l1.37,1.12a.94.94,0,0,0,.63.23A1,1,0,0,0,29,13.82ZM24,24.2a.8.8,0,0,1-.8.8H20.3a.8.8,0,0,1-.8-.8V22.8A2.81,2.81,0,0,0,16.7,20H15.3a2.81,2.81,0,0,0-2.8,2.8v1.4a.8.8,0,0,1-.8.8H8.8a.8.8,0,0,1-.8-.8V11.84l8-6.55,8,6.55Z" />
    </svg>
  );
}

function PlusSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 28 28">
      <path d="M21,15H17V11a1,1,0,0,0-2,0v4H11a1,1,0,0,0,0,2h4v4a1,1,0,0,0,2,0V17h4a1,1,0,0,0,0-2ZM23,5H9A4,4,0,0,0,5,9V23a4,4,0,0,0,4,4H23a4,4,0,0,0,4-4V9A4,4,0,0,0,23,5Zm2,18a2,2,0,0,1-2,2H9a2,2,0,0,1-2-2V9A2,2,0,0,1,9,7H23a2,2,0,0,1,2,2Z" />
    </svg>
  );
}

function MessageSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 30 30">
      <path d="M21,5H11a6,6,0,0,0-6,6V28.5a1,1,0,0,0,.81,1l.19,0a1,1,0,0,0,.93-.63A3,3,0,0,1,9.69,27H21a6,6,0,0,0,6-6V11A6,6,0,0,0,21,5Zm4,16a4,4,0,0,1-4,4H9.69A4.9,4.9,0,0,0,7,25.79V11a4,4,0,0,1,4-4H21a4,4,0,0,1,4,4Zm-6-8H13a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm-3,4H13a1,1,0,0,0,0,2h3a1,1,0,0,0,0-2Z" />
    </svg>
  );
}

function TickSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 25 25">
      <path d="M23,12a1,1,0,0,0-.28-.7l-1.15-1.19a1,1,0,0,0-.72-.3,1,1,0,0,0-1,1,1,1,0,0,0,.28.69l.48.5-.69.72a4,4,0,0,0-1.14,2.78,3.43,3.43,0,0,0,0,.56l.14,1-1,.17a4,4,0,0,0-2.85,2.07l-.47.88-.91-.44a3.94,3.94,0,0,0-1.75-.4,4.15,4.15,0,0,0-1.76.4l-.9.44-.47-.88A4,4,0,0,0,6,17.23l-1-.17.14-1a3.39,3.39,0,0,0,0-.55,4,4,0,0,0-1.13-2.78L3.39,12l.69-.72A4,4,0,0,0,5.22,8.5a3.43,3.43,0,0,0,0-.56L5,6.94l1-.17A4,4,0,0,0,8.87,4.7l.47-.88.91.44a3.94,3.94,0,0,0,1.75.4,4.15,4.15,0,0,0,1.76-.4l.9-.44.46.86a1,1,0,0,0,1.93-.39,1,1,0,0,0-.18-.57L16,2a1,1,0,0,0-.88-.53,1,1,0,0,0-.44.1l-1.76.87a2.14,2.14,0,0,1-.89.2,2.06,2.06,0,0,1-.88-.2L9.35,1.59A1,1,0,0,0,8,2L7.11,3.76a2,2,0,0,1-1.43,1l-1.94.34a1,1,0,0,0-.83,1,.66.66,0,0,0,0,.14l.28,2a2.64,2.64,0,0,1,0,.28,2,2,0,0,1-.57,1.39L1.28,11.31a1,1,0,0,0,0,1.38l1.38,1.43a2,2,0,0,1,.56,1.38,2.64,2.64,0,0,1,0,.28l-.28,2a.66.66,0,0,0,0,.14,1,1,0,0,0,.83,1l1.94.34a2,2,0,0,1,1.43,1L8,22a1,1,0,0,0,1.32.43l1.76-.87a2.14,2.14,0,0,1,.89-.2,2.06,2.06,0,0,1,.88.2l1.77.87a1,1,0,0,0,.44.1A1,1,0,0,0,16,22l.92-1.74a2,2,0,0,1,1.43-1l1.94-.34a1,1,0,0,0,.83-1,.66.66,0,0,0,0-.14l-.28-2a2.64,2.64,0,0,1,0-.28,2,2,0,0,1,.57-1.39l1.37-1.42A1,1,0,0,0,23,12ZM9.71,10.29A1,1,0,0,0,9,10a1,1,0,0,0-1,1,1,1,0,0,0,.29.71L12,15.41l9.71-9.7A1,1,0,0,0,22,5a1,1,0,0,0-1-1,1,1,0,0,0-.71.29L12,12.59Z" />
    </svg>
  );
}

function ShareSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 14a1 1 0 00-1 1v3a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h4a1 1 0 000-2H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3v-3a1 1 0 00-1-1zm-1.41-8H17a9 9 0 00-9 9 1 1 0 002 0 7 7 0 017-7h1.59l-2.3 2.29A1 1 0 0016 11a1 1 0 001 1 1 1 0 00.71-.29L22.41 7l-4.7-4.71A1 1 0 0017 2a1 1 0 00-1 1 1 1 0 00.29.71z" />
    </svg>
  );
}

function SaleVidSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="1em" viewBox="0 0 25 25">
      <g transform="translate(0.000000,28.5) scale(0.006081,-0.006081)" fill="currentColor" stroke="none">
        <path d="M413 4166 c-186 -45 -342 -198 -397 -387 -15 -50 -16 -178 -14 -1235 l3 -1179 22 -60 c57 -149 179 -271 330 -328 l58 -22 1459 -3 c1314 -2 1466 -1 1515 14 174 50 322 192 377 364 14 43 19 105 23 291 l6 236 585 -319 c425 -233 597 -322 627 -325 38 -5 46 -2 78 30 l35 35 0 1281 0 1281 -27 30 c-20 22 -40 33 -68 36 -37 5 -78 -16 -635 -319 l-595 -325 -6 241 c-4 149 -11 257 -19 282 -46 146 -158 278 -288 340 -120 57 -56 55 -1597 54 -1110 -1 -1431 -3 -1472 -13z m2832 -363 c54 -28 129 -110 146 -159 12 -32 14 -217 14 -1084 0 -1040 0 -1045 -21 -1090 -24 -52 -88 -121 -136 -147 -31 -17 -100 -18 -1358 -18 l-1325 0 -40 22 c-47 25 -105 84 -131 133 -18 33 -19 81 -19 1105 l0 1070 21 36 c50 85 116 136 193 149 25 4 624 7 1331 6 l1285 -1 40 -22z m1505 -1253 l0 -841 -42 24 c-79 45 -450 248 -633 348 -44 23 -125 68 -180 100 l-100 56 -3 320 -2 320 67 35 c90 46 732 397 808 441 33 19 66 36 73 36 9 1 12 -173 12 -839z" />
        <path d="M1784 3728 c-25 -13 -48 -34 -60 -57 -10 -20 -22 -38 -25 -41 -4 -3 -15 -34 -24 -70 -9 -36 -22 -71 -27 -78 -6 -7 -8 -15 -5 -19 4 -3 3 -11 -2 -17 -4 -6 -16 -42 -26 -81 -11 -38 -22 -72 -26 -75 -4 -3 -17 -43 -29 -90 -12 -47 -30 -91 -38 -97 -12 -10 -90 -13 -314 -13 -164 0 -298 -4 -298 -8 0 -4 -16 -14 -36 -21 -41 -15 -90 -60 -104 -96 -16 -43 -11 -156 8 -191 18 -33 91 -100 130 -117 12 -6 22 -14 22 -18 0 -5 18 -18 40 -29 22 -11 40 -25 40 -30 0 -5 8 -11 18 -14 9 -3 31 -18 47 -32 17 -14 42 -32 58 -40 15 -8 27 -18 27 -22 0 -4 15 -16 34 -26 19 -10 47 -31 61 -47 25 -25 27 -33 21 -73 -4 -25 -11 -46 -15 -46 -4 0 -18 -40 -30 -90 -13 -49 -27 -90 -30 -90 -4 0 -12 -26 -19 -57 -7 -32 -18 -69 -25 -83 -8 -14 -22 -56 -32 -93 -47 -174 29 -287 194 -287 69 0 115 16 161 57 26 23 107 81 130 93 12 6 29 18 38 27 9 8 42 33 72 54 30 21 62 45 70 52 29 25 95 67 105 67 10 0 76 -42 105 -67 8 -7 40 -31 70 -52 30 -21 63 -46 72 -54 9 -9 26 -21 38 -27 23 -12 104 -70 130 -93 46 -41 92 -57 161 -57 166 0 240 111 193 290 -10 38 -21 70 -24 70 -4 0 -15 35 -26 78 -10 42 -21 79 -25 82 -4 3 -17 43 -29 90 -13 47 -27 87 -32 91 -4 3 -11 25 -14 50 -6 43 -4 47 31 78 21 18 48 37 61 43 13 6 24 15 24 19 0 5 12 15 28 23 15 8 41 26 57 40 17 14 38 29 48 32 9 3 17 9 17 14 0 5 18 19 40 30 22 11 40 24 40 29 0 4 10 12 23 18 38 17 111 84 129 117 19 35 24 148 8 191 -14 36 -63 81 -104 96 -20 7 -36 17 -36 21 0 4 -134 8 -298 8 -224 0 -302 3 -314 13 -8 6 -26 50 -38 97 -12 47 -25 87 -29 90 -4 3 -15 37 -26 75 -10 39 -22 75 -26 81 -5 6 -6 14 -2 17 3 4 1 12 -5 19 -5 7 -18 42 -27 78 -9 36 -20 67 -24 70 -3 3 -15 21 -25 41 -27 52 -87 79 -174 78 -47 0 -79 -6 -108 -21z m148 -305 c8 -10 47 -117 86 -238 61 -189 76 -225 104 -252 18 -18 46 -37 61 -42 17 -7 123 -11 267 -11 230 0 239 -1 253 -21 8 -11 13 -29 10 -39 -3 -10 -90 -80 -194 -155 -104 -76 -199 -151 -211 -167 -41 -58 -36 -95 41 -334 39 -121 71 -230 71 -242 0 -20 -26 -42 -48 -42 -5 0 -97 63 -203 140 -109 79 -210 145 -231 151 -26 6 -50 6 -75 0 -22 -6 -123 -72 -232 -151 -106 -77 -198 -140 -203 -140 -22 0 -48 22 -48 42 0 12 32 121 71 242 77 239 82 276 41 334 -12 16 -107 91 -211 167 -104 75 -191 145 -194 155 -3 10 2 28 10 39 14 20 23 21 253 21 144 0 250 4 267 11 15 5 43 24 61 42 28 27 43 63 104 252 72 222 87 255 118 255 9 0 24 -8 32 -17z" />
      </g>
    </svg>
  );
}

export function ModelIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={ModelSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}

export function HomeIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={HomeSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}

export function PlusIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={PlusSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}

export function MessageIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={MessageSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}

export function SaleVidIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={SaleVidSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}

export function TickIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={TickSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}

export function ShareIcon({
  style, rotate, spin, className
}: IIcons) {
  return <Icon component={ShareSvg} className={className ? `${className} anticon-custom` : 'anticon-custom'} {...{ style, rotate, spin }} />;
}