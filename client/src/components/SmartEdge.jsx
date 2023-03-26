import React from 'react'
import { useNodes, BezierEdge } from 'reactflow'
import {
	getSmartEdge,
	svgDrawSmoothLinePath,
	svgDrawStraightLinePath,
	pathfindingAStarDiagonal,
	pathfindingAStarNoDiagonal,
	pathfindingJumpPointNoDiagonal,
} from '@tisoap/react-flow-smart-edge'

export default function SmartEdge(props) {
	const {
		id,
		sourcePosition,
		targetPosition,
		sourceX,
		sourceY,
		targetX,
		targetY,
		style,
		markerStart,
		markerEnd
	} = props

	const nodes = useNodes()

  const options = {
		drawEdge: svgDrawSmoothLinePath,
		generatePath: pathfindingJumpPointNoDiagonal,
		nodePadding: 20
	}

	const getSmartEdgeResponse = getSmartEdge({
		sourcePosition,
		targetPosition,
		sourceX,
		sourceY,
		targetX,
		targetY,
		nodes,
		options
	})

	// If the value returned is null, it means "getSmartEdge" was unable to find
	// a valid path, and you should do something else instead
	if (getSmartEdgeResponse === null) {
		return <BezierEdge {...props} />
	}

	const { svgPathString } = getSmartEdgeResponse

	return (
		<path
			style={style}
			className='react-flow__edge-path'
			d={svgPathString}
			markerEnd={markerEnd}
			markerStart={markerStart}
		/>
	)
}