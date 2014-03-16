/** @jsx React.DOM */

db = {};
db.messages = new Meteor.Collection( 'messages' );

if ( Meteor.isClient ) {

	// Message component
	var Message = React.createClass({

		render: function () {
			return this.transferPropsTo(
				<div className="message">
					<span className="message">{this.props.text}</span>
					<span className="time">{this.props.posted}</span>
					<span className="name">{this.props.name}</span>
				</div>
			)
		}

	});

	// Messages compontent, defines behavior for Message compontents
	// contained within
	var Messages = React.createClass( {

		mixins: [ ReactMeteor.Mixin ],

		getMeteorState: function ( ) {
			var selected = db.messages.findOne( Session.get( 'selectedMessage' ) );
			return {
				messages: db.messages.find( {}, {
					sort: {
						posted: 1,
						name: 1
					}
				} ).fetch( ),
				selected: selected
			};
		},

		changes: {
			messages: {
				selected: function (id) {
					Session.set('selectedMessage', id);
				}
			}
		},

		selectMessage: function (id) {
			this.change('messages.selected', id);
		},

		renderMessage: function ( model ) {
			var _id = this.state.selected && this.state.selected._id;
			return (
				<Message key={model._id}
						 name={model.name}
						 posted={model.posted}
						 text={model.text}
						 className={model._id.equals(_id) ? "selected" : ""}
						 onClick={this.selectMessage.bind( this, model._id )} />
			)
		},

		render: function() {
			return (
				<div className="messages">
					{_(this.state.messages).map(this.renderMessage)}
				</div>
			)

		}
	});

	Meteor.startup( function ( ) {
		Meteor.subscribe( 'stream', function ( ) {
			React.renderComponent( <Messages />, document.body );
		} );
	} );

}

if ( Meteor.isServer ) {

	db.messages.allow({
		insert: function () {
			return true;
		}
	})

	Meteor.startup( function ( ) {
		Meteor.publish( 'stream', function ( ) {
			return db.messages.find( {}, {
				sort: {
					posted: 1
				}
			} );
		} );
	} );
}
