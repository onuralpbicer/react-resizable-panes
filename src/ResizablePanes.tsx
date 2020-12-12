import { createStyles, makeStyles } from '@material-ui/styles'
import React, { useEffect, useRef, useState } from 'react'
import { Property } from 'csstype'
import clsx from 'clsx'

const useStyles = makeStyles(() =>
    createStyles({
        container: ({ vertical }: ResizablePanesProps) => ({
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            msFlexDirection: vertical ? 'column' : 'row',
            WebkitFlexDirection: vertical ? 'column' : 'row',
            height: '100%',
            width: '100%',
            userSelect: 'none',
            msUserSelect: 'none',
            MozUserSelect: 'none',
            WebkitUserSelect: 'none',
        }),
        resizerOuter: ({ vertical, resizeCursor }: ResizablePanesProps) => ({
            height: vertical ? '2px' : '100%',
            padding: vertical ? '5px 0' : '0 5px',
            width: vertical ? '100%' : '2px',
            cursor: resizeCursor || 'row-resize',
        }),
        resizerInner: ({ resizeColor }: ResizablePanesProps) => ({
            height: '100%',
            width: '100%',
            backgroundColor: resizeColor || 'lightgray',
        }),
        both: {
            overflow: 'auto',
        },
        pane1: {
            flex: 'none',
        },
        pane2: {
            flex: 1,
        },
        cursor: ({ resizeCursor, vertical }: ResizablePanesProps) => ({
            cursor: resizeCursor
                ? resizeCursor
                : vertical
                ? 'row-resize'
                : 'col-resize',
        }),
    }),
)

export interface ResizablePanesProps {
    vertical?: boolean
    resizeCursor?: Property.Cursor
    resizeColor?: Property.BackgroundColor
    pane1: JSX.Element
    pane2: JSX.Element
    pane1MinSize?: number
    pane2MinSize?: number
    pane1ClassName?: string
    pane2ClassName?: string
    resizerClassName?: string
}

interface MousePosition {
    clientX: number
    clientY: number
}

const ResizablePanes = (props: ResizablePanesProps): JSX.Element => {
    const classes = useStyles(props)
    const {
        pane1,
        pane2,
        pane1MinSize,
        pane2MinSize,
        pane1ClassName,
        pane2ClassName,
        resizerClassName,
        vertical,
    } = props

    const [pane1Size, setPane1Size] = useState<number | undefined>(undefined)
    const [mouseLocation, setMouseLocation] = useState<MousePosition | null>(
        null,
    )

    const resizer = () => (
        <div
            ref={resizerRef}
            className={clsx(
                classes.resizerOuter,
                classes.cursor,
                resizerClassName,
            )}
            onMouseDown={(event) => {
                const { clientX, clientY } = event
                setMouseLocation({
                    clientX,
                    clientY,
                })
            }}
        >
            <div className={classes.resizerInner} />
        </div>
    )

    const handleMouseMove = (event: MouseEvent) => {
        if (mouseLocation) {
            setPane1Size(vertical ? event.clientY : event.clientX)
        }
    }

    const handleMouseUp = () => {
        if (mouseLocation) setMouseLocation(null)
    }

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    })

    const containerRef = useRef<HTMLDivElement | null>(null)
    const containerSize = () =>
        vertical
            ? containerRef.current?.clientHeight
            : containerRef.current?.clientWidth
    const resizerRef = useRef<HTMLDivElement | null>(null)
    const resizerSize = () =>
        vertical
            ? resizerRef.current?.clientHeight
            : resizerRef.current?.clientWidth

    useEffect(() => {
        const contSize = containerSize()
        const resSize = resizerSize()
        if (resizerRef.current && contSize && resSize) {
            setPane1Size(contSize / 2 - resSize / 2)
        }
    }, [vertical])

    const pane1Min = pane1MinSize || 50
    const contSize = containerSize()
    const resSize = resizerSize()
    const pane1Max =
        contSize && resSize && contSize - (pane2MinSize || 50) - resSize
    return (
        <div
            ref={containerRef}
            className={clsx(classes.container, {
                [classes.cursor]: !!mouseLocation,
            })}
        >
            <div
                style={{
                    height: vertical ? pane1Size : '100%',
                    minHeight: vertical ? pane1Min : undefined,
                    maxHeight: vertical ? pane1Max : undefined,
                    width: vertical ? '100%' : pane1Size,
                    minWidth: vertical ? undefined : pane1Min,
                    maxWidth: vertical ? undefined : pane1Max,
                }}
                className={clsx(classes.both, classes.pane1, pane1ClassName)}
            >
                {pane1}
            </div>
            {resizer()}
            <div className={clsx(classes.both, classes.pane2, pane2ClassName)}>
                {pane2}
            </div>
        </div>
    )
}

export default ResizablePanes
